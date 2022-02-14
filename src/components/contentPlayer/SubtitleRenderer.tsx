import { CanvasProvider } from "aribb24.js"
import clsx from "clsx"
import React, { memo, useEffect, useRef } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerAribSubtitleDataAtom,
  contentPlayerDisplayingAribSubtitleDataAtom,
  contentPlayerPlayingTimeAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerSpeedAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerTsFirstPcrAtom,
} from "../../atoms/contentPlayer"
import { contentPlayerServiceSelector } from "../../atoms/contentPlayerSelectors"
import { subtitleSetting } from "../../atoms/settings"
import { SUBTITLE_DEFAULT_FONT } from "../../constants/font"
import { tryBase64ToUint8Array } from "../../utils/string"
import { getAribb24Configuration } from "../../utils/subtitle"

export const CoiledSubtitleRenderer: React.VFC<{}> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const speed = useRecoilValue(contentPlayerSpeedAtom)
  const isSubtitleEnabled = useRecoilValue(contentPlayerSubtitleEnabledAtom)
  const setDisplayingAribSubtitleData = useSetRecoilState(
    contentPlayerDisplayingAribSubtitleDataAtom
  )
  const selectedService = useRecoilValue(contentPlayerServiceSelector)
  const positionUpdateTrigger = useRecoilValue(
    contentPlayerPositionUpdateTriggerAtom
  )
  const latestTimer = useRef<NodeJS.Timer>()
  useEffect(() => {
    // リセット処理
    setDisplayingAribSubtitleData(null)
    latestTimer.current && clearTimeout(latestTimer.current)
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
  }, [selectedService, positionUpdateTrigger])
  const setting = useRecoilValue(subtitleSetting)

  // 字幕ペイロード更新時にパースしたデータをレンダリングする
  const aribSubtitleData = useRecoilValue(contentPlayerAribSubtitleDataAtom)
  const firstPcr = useRecoilValue(contentPlayerTsFirstPcrAtom)
  const playingTime = useRecoilValue(contentPlayerPlayingTimeAtom)
  const displayingSubtitle = useRef("")
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !firstPcr) return
    const context = canvas.getContext("2d")
    if (!context) return
    if (!aribSubtitleData) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      setDisplayingAribSubtitleData(null)
      return
    }
    const decoded = tryBase64ToUint8Array(aribSubtitleData.data)
    if (!decoded) return
    const fromZero = ((aribSubtitleData.pts * 9) / 100 - firstPcr) / 90_000
    const pts = fromZero - playingTime / 1000
    const provider = new CanvasProvider(decoded, pts)
    const estimate = provider.render()
    if (!estimate) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const font = setting.font || SUBTITLE_DEFAULT_FONT
    latestTimer.current = setTimeout(() => {
      provider.render(
        getAribb24Configuration({
          canvas,
          normalFont: font,
          gaijiFont: font,
        })
      )
      setDisplayingAribSubtitleData(decoded)
      displayingSubtitle.current = aribSubtitleData.data
      if (estimate.endTime === Number.POSITIVE_INFINITY) return
      setTimeout(() => {
        if (displayingSubtitle.current !== aribSubtitleData.data) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        displayingSubtitle.current = ""
        setDisplayingAribSubtitleData(null)
      }, ((estimate.endTime - estimate.startTime) / speed) * 1000)
    }, (estimate.startTime / speed) * 1000)
  }, [aribSubtitleData])

  return (
    <canvas
      width={1920}
      height={1080}
      className={clsx(
        "pointer-events-none",
        "w-full",
        !isSubtitleEnabled && "opacity-0"
      )}
      style={{ aspectRatio: "16/9" }}
      ref={canvasRef}
    ></canvas>
  )
})
