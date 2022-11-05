import { CanvasProvider } from "aribb24.js"
import clsx from "clsx"
import React, { memo, useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerAribSubtitleDataAtom,
  contentPlayerDisplayingAribSubtitleDataAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerTsFirstPcrAtom,
} from "../../atoms/contentPlayer"
import { contentPlayerIsPlayingFamilyAtom } from "../../atoms/contentPlayerFamilies"
import { globalContentPlayerPlayingContentFamily } from "../../atoms/globalFamilies"
import { subtitleSetting } from "../../atoms/settings"
import { SUBTITLE_DEFAULT_FONT } from "../../constants/font"
import { tryBase64ToUint8Array } from "../../utils/string"
import {
  ProviderCue,
  getAribb24Configuration,
  HighResMetadataTextTrack,
} from "../../utils/subtitle"

export const CoiledSubtitleRenderer: React.FC<{
  internalPlayingTimeRef: React.MutableRefObject<number>
}> = memo(({ internalPlayingTimeRef }) => {
  const contentPlayerIsPlayingAtom = contentPlayerIsPlayingFamilyAtom(
    window.id ?? 0
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isSubtitleEnabled = useRecoilValue(contentPlayerSubtitleEnabledAtom)
  const setDisplayingAribSubtitleData = useSetRecoilState(
    contentPlayerDisplayingAribSubtitleDataAtom
  )
  const setting = useRecoilValue(subtitleSetting)

  const aribSubtitleData = useRecoilValue(contentPlayerAribSubtitleDataAtom)
  const firstPcr = useRecoilValue(contentPlayerTsFirstPcrAtom)

  // キューリストリセット/キャンバスリセットタイミング依存
  const [cueTrackDep, setCueTrackDep] = useState(0)
  const cueTrack = useRef<HighResMetadataTextTrack | null>()
  useEffect(() => {
    const track = new HighResMetadataTextTrack(internalPlayingTimeRef)
    track.startPolling()
    cueTrack.current = track

    const onCueChanged = () => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      setDisplayingAribSubtitleData(null)
      const lastCue = track.activeCues[track.activeCues.length - 1] as
        | ProviderCue
        | undefined
      if (!lastCue) {
        return
      }
      const playingTime = internalPlayingTimeRef.current / 1_000
      if (playingTime < lastCue.startTime || lastCue.endTime < playingTime) {
        return
      }
      const font = setting.font || SUBTITLE_DEFAULT_FONT
      lastCue.provider.render(
        getAribb24Configuration({
          canvas,
          normalFont: font,
          gaijiFont: font,
        })
      )
      // https://github.com/monyone/aribb24.js/blob/f3167d4b0fd82969ac4a314be57df29648637322/src/canvas-renderer.ts#L418
      for (let i = track.activeCues.length - 2; i >= 0; i--) {
        const cue = track.activeCues[i]
        cue.endTime = Math.min(cue.endTime, lastCue.startTime)
        if (cue.startTime === cue.endTime) {
          // .. if duplicate subtitle appeared
          track.removeCue(cue)
        }
      }
      setDisplayingAribSubtitleData(lastCue.data)
    }

    track.addEventListener("cuechange", onCueChanged)

    return () => {
      track.removeEventListener("cuechange", onCueChanged)
      track.stopPolling()
      cueTrack.current = null
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      setDisplayingAribSubtitleData(null)
    }
  }, [cueTrackDep])
  const playingContent = useRecoilValue(
    globalContentPlayerPlayingContentFamily(window.id ?? 0)
  )
  const positionUpdateTrigger = useRecoilValue(
    contentPlayerPositionUpdateTriggerAtom
  )
  // コンテンツか位置が更新されたらトラックリセット
  useEffect(() => {
    setCueTrackDep(performance.now())
  }, [playingContent, positionUpdateTrigger])
  const isSeekable = useRecoilValue(contentPlayerIsSeekableAtom)
  const isPlaying = useRecoilValue(contentPlayerIsPlayingAtom)
  // 再生開始時に長さ不定の場合はplayingTimeリセットされるので合わせてトラックリセット
  useEffect(() => {
    if (isPlaying && !isSeekable) {
      setCueTrackDep(performance.now())
    }
  }, [isPlaying])

  // 字幕更新時にキュー挿入
  useEffect(() => {
    const track = cueTrack.current
    if (!track || !aribSubtitleData) {
      return
    }
    const decoded = tryBase64ToUint8Array(aribSubtitleData.data)
    if (!decoded) {
      return
    }
    const fromZero = ((aribSubtitleData.pts * 9) / 100 - firstPcr) / 90_000
    const provider = new CanvasProvider(decoded, fromZero)
    const estimate = provider.render()
    if (!estimate) {
      return
    }
    const cue = new ProviderCue(provider, estimate, decoded)
    track.addCue(cue)
  }, [aribSubtitleData])

  return (
    <canvas
      width={1920}
      height={1080}
      className={clsx(
        "aspect-video",
        "pointer-events-none",
        "w-full",
        "h-full",
        "object-contain",
        !isSubtitleEnabled && "opacity-0"
      )}
      ref={canvasRef}
    ></canvas>
  )
})
