import React, { memo, useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  mainPlayerAribSubtitleData,
  mainPlayerDisplayingAribSubtitleData,
  mainPlayerIsPlaying,
  mainPlayerPlayingTime,
  mainPlayerSubtitleEnabled,
  mainPlayerTsPts,
} from "../../atoms/mainPlayer"
import { CanvasProvider } from "aribb24.js"
import { tryBase64ToUint8Array } from "../../utils/string"

export const CoiledSubtitleRenderer: React.VFC<{}> = memo(({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const subtitleEnabled = useRecoilValue(mainPlayerSubtitleEnabled)
  const isPlaying = useRecoilValue(mainPlayerIsPlaying)
  const setDisplayingAribSubtitleData = useSetRecoilState(
    mainPlayerDisplayingAribSubtitleData
  )
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (subtitleEnabled === false || isPlaying === false) {
      // 字幕オフでキャンバスをクリアする
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
      setDisplayingAribSubtitleData(null)
    }
  }, [subtitleEnabled, isPlaying])

  const [height, setHeight] = useState("100%")
  // 画面リサイズ時にキャンバスも追従させる
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onResize = () => {
      const { width } = canvas.getBoundingClientRect()
      setHeight(`${Math.ceil(width / 1.777777778)}px`)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  // 字幕ペイロード更新時にパースしたデータをタイムラインにプッシュする
  const aribSubtitleData = useRecoilValue(mainPlayerAribSubtitleData)
  const tsPts = useRecoilValue(mainPlayerTsPts)
  const playingTime = useRecoilValue(mainPlayerPlayingTime)
  const displayingSubtitle = useRef("")
  useEffect(() => {
    const canvas = canvasRef.current
    if (
      !aribSubtitleData ||
      !canvas ||
      !tsPts ||
      subtitleEnabled === false ||
      isPlaying === false
    )
      return
    const decoded = tryBase64ToUint8Array(aribSubtitleData.data)
    if (!decoded) return
    const fromZero = ((aribSubtitleData.pts * 9) / 100 - tsPts[1]) / 90_000
    const pts = fromZero - playingTime / 1000
    const provider = new CanvasProvider(decoded, pts)
    const estimate = provider.render()
    if (!estimate) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      provider.render({
        canvas,
        width: 1920,
        height: 1080,
        useStrokeText: true,
      })
      setDisplayingAribSubtitleData(decoded)
      displayingSubtitle.current = aribSubtitleData.data
      if (estimate.endTime === Number.MAX_SAFE_INTEGER) return
      setTimeout(() => {
        if (displayingSubtitle.current !== aribSubtitleData.data) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        displayingSubtitle.current = ""
        setDisplayingAribSubtitleData(null)
      }, (estimate.endTime - estimate.startTime) * 1000)
    }, estimate.startTime * 1000)
  }, [aribSubtitleData])

  return (
    <canvas
      width={1920}
      height={1080}
      className="absolute top-0 left-0 pointer-events-none w-full"
      style={{ height }}
      ref={canvasRef}
    ></canvas>
  )
})
