import React, { useEffect, useRef, useState } from "react"
import { useRecoilValue } from "recoil"
import WebChimeraJs from "webchimera.js"
import { mainPlayerUrl, mainPlayerVolume } from "../../atoms/mainPlayer"
import { VideoRenderer } from "../../utils/videoRenderer"
import { VLCLogFilter } from "../../utils/vlc"

export const Player: React.VFC<{}> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [aspect, setAspect] = useState(1.777777778)
  const [width, setWidth] = useState(1280)
  const height = Math.ceil(width * aspect)

  const playerRef = useRef<WebChimeraJs.Player | null>(null)

  const url = useRecoilValue(mainPlayerUrl)
  useEffect(() => {
    if (!url || !playerRef.current) return
    playerRef.current.play(url)
    console.log("URL再生:", url)
  }, [url])

  const volume = useRecoilValue(mainPlayerVolume)
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.volume = volume
    console.log("音量変更:", volume)
  }, [volume])

  useEffect(() => {
    const renderContext = new VideoRenderer(canvasRef.current!)
    const player = WebChimeraJs.createPlayer()
    player.onLogMessage = (level, message, format) => {
      const parsed = VLCLogFilter(message)
      switch (parsed.category) {
        case "resize":
          console.log(message)
          if (parsed.width && parsed.height) {
            setAspect(width / height)
            console.log(`Aspect: ${width / height}`)
          }
          break
        case "unknown":
          console.log(message)
          break
        default:
          break
      }
    }
    player.onFrameReady = (frame) => {
      renderContext.render(
        frame,
        frame.width,
        frame.height,
        frame.uOffset,
        frame.vOffset
      )
    }
    // @ts-ignore
    window.player = player
    playerRef.current = player
    const onResize = () => {
      if (!containerRef.current) return
      setWidth(containerRef.current.clientWidth)
    }
    window.addEventListener("resize", onResize)
    onResize()
    return () => {
      window.removeEventListener("resize", onResize)
      player.close()
    }
  }, [])
  return (
    <div className="w-full" ref={containerRef}>
      <canvas style={{ width: width, height: height }} ref={canvasRef}></canvas>
    </div>
  )
}
