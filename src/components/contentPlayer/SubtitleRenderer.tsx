import { CanvasProvider } from "aribb24.js"
import clsx from "clsx"
import React, { memo, useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerAribSubtitleData,
  contentPlayerDisplayingAribSubtitleData,
  contentPlayerPlayingTime,
  contentPlayerPositionUpdateTrigger,
  contentPlayerSelectedService,
  contentPlayerSubtitleEnabled,
  contentPlayerTsFirstPcr,
} from "../../atoms/contentPlayer"
import { tryBase64ToUint8Array } from "../../utils/string"

export const CoiledSubtitleRenderer: React.VFC<{}> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isSubtitleEnabled = useRecoilValue(contentPlayerSubtitleEnabled)
  const setDisplayingAribSubtitleData = useSetRecoilState(
    contentPlayerDisplayingAribSubtitleData
  )
  const selectedService = useRecoilValue(contentPlayerSelectedService)
  const positionUpdateTrigger = useRecoilValue(
    contentPlayerPositionUpdateTrigger
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

  // 字幕ペイロード更新時にパースしたデータをレンダリングする
  const aribSubtitleData = useRecoilValue(contentPlayerAribSubtitleData)
  const firstPcr = useRecoilValue(contentPlayerTsFirstPcr)
  const playingTime = useRecoilValue(contentPlayerPlayingTime)
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
    latestTimer.current = setTimeout(() => {
      provider.render({
        canvas,
        useStrokeText: true,
        keepAspectRatio: true,
        normalFont: "'Rounded M+ 1m for ARIB'",
        gaijiFont: "'Rounded M+ 1m for ARIB'",
        drcsReplacement: true,
      })
      setDisplayingAribSubtitleData(decoded)
      displayingSubtitle.current = aribSubtitleData.data
      if (estimate.endTime === Number.POSITIVE_INFINITY) return
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
      className={clsx(
        "pointer-events-none",
        "w-full",
        !isSubtitleEnabled && "opacity-0"
      )}
      style={{ height }}
      ref={canvasRef}
    ></canvas>
  )
})
