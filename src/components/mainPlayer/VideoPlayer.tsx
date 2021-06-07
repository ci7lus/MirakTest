import React, { memo, useEffect, useRef, useState } from "react"
import fs from "fs"
import path from "path"
import { remote } from "electron"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import WebChimeraJs from "webchimera.js"
import { toast } from "react-toastify"
import {
  mainPlayerAribSubtitleData,
  mainPlayerAudioChannel,
  mainPlayerAudioTrack,
  mainPlayerAudioTracks,
  mainPlayerDisplayingAribSubtitleData,
  mainPlayerIsPlaying,
  mainPlayerPlayingTime,
  mainPlayerScreenshotTrigger,
  mainPlayerSelectedService,
  mainPlayerSubtitleEnabled,
  mainPlayerTsFirstPcr,
  mainPlayerUrl,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { VideoRenderer } from "../../utils/videoRenderer"
import { VLCLogFilter } from "../../utils/vlc"
import { screenshotSetting } from "../../atoms/settings"
import dayjs from "dayjs"
import { CanvasProvider } from "aribb24.js"
import { useThrottleFn } from "react-use"

export const CoiledVideoPlayer: React.VFC<{}> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [aspect, setAspect] = useState(16 / 9)
  const [width, setWidth] = useState(1280)
  const height = Math.ceil(width / aspect)

  useEffect(() => {
    const remoteWindow = remote.getCurrentWindow()
    remoteWindow.setAspectRatio(aspect)
  }, [aspect])

  const playerRef = useRef<WebChimeraJs.Player | null>(null)

  const url = useRecoilValue(mainPlayerUrl)
  useEffect(() => {
    if (!playerRef.current) return
    if (url) {
      playerRef.current.play(url)
      console.log("URL再生:", url)
    } else {
      playerRef.current.stop()
      console.log("再生停止")
    }
  }, [url])
  const [isPlaying, setIsPlaying] = useRecoilState(mainPlayerIsPlaying)
  useEffect(() => {
    if (!playerRef.current || !url) return
    if (isPlaying && !playerRef.current.playing) {
      playerRef.current.play(url)
      console.log("再生再開", url)
    } else if (!isPlaying) {
      playerRef.current.stop()
      console.log("再生停止")
    }
  }, [isPlaying])

  const volume = useRecoilValue(mainPlayerVolume)
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.volume = volume
    console.log("音量変更:", volume)
  }, [volume])

  const [subtitleEnabled, setSubtitleEnabled] = useRecoilState(
    mainPlayerSubtitleEnabled
  )
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.subtitles.track = Number(subtitleEnabled)
    console.log("字幕変更:", Number(subtitleEnabled))
  }, [subtitleEnabled])

  const audioChannel = useRecoilValue(mainPlayerAudioChannel)
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.audio.channel = audioChannel
    console.log("オーディオチャンネル変更:", audioChannel)
  }, [audioChannel])

  const audioTrack = useRecoilValue(mainPlayerAudioTrack)
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.audio.track = audioTrack
    console.log("オーディオトラック変更:", audioTrack)
  }, [audioTrack])
  const setAudioTracks = useSetRecoilState(mainPlayerAudioTracks)

  // スクリーンショットフォルダ初期設定
  const [screenshot, setScreenshot] = useRecoilState(screenshotSetting)
  useEffect(() => {
    if (screenshot.basePath) return
    const pictures = remote.app.getPath("pictures")
    if (!pictures) return
    fs.promises
      .stat(pictures)
      .then(() => {
        setScreenshot({ ...screenshot, basePath: pictures })
        console.log("スクリーンショット用パス:", pictures)
      })
      .catch(console.error)
  }, [])
  const selectedService = useRecoilValue(mainPlayerSelectedService)

  const displayingAribSubtitleData = useRecoilValue(
    mainPlayerDisplayingAribSubtitleData
  )

  // スクリーンショットフォルダ初期設定
  const screenshotTrigger = useRecoilValue(mainPlayerScreenshotTrigger)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!screenshotTrigger || !canvas) return
    ;(async () => {
      try {
        const contentCanvas = document.createElement("canvas")
        contentCanvas.height = canvas.height
        contentCanvas.width = Math.ceil(canvas.height * aspect)
        const context = contentCanvas.getContext("2d", { alpha: false })
        if (!context) throw new Error("ctx")
        context.drawImage(
          canvas,
          0,
          0,
          contentCanvas.width,
          contentCanvas.height
        )
        if (displayingAribSubtitleData && screenshot.includeSubtitle === true) {
          const subtitleCanvas = document.createElement("canvas")
          subtitleCanvas.height = contentCanvas.height
          subtitleCanvas.width = contentCanvas.width
          const provider = new CanvasProvider(displayingAribSubtitleData, 0)
          provider.render({
            canvas: subtitleCanvas,
            useStrokeText: true,
            keepAspectRatio: true,
            normalFont: "'Rounded M+ 1m for ARIB'",
            gaijiFont: "'Rounded M+ 1m for ARIB'",
          })
          context.drawImage(
            subtitleCanvas,
            0,
            0,
            contentCanvas.width,
            contentCanvas.height
          )
        }
        const blob = await new Promise<Blob | null>((res) =>
          contentCanvas.toBlob((blob) => res(blob), "image/png", 1)
        )
        if (!blob) throw new Error("blob")
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ [blob.type]: blob }),
          ])
          toast.info("キャプチャしました", {
            autoClose: 2000,
            pauseOnFocusLoss: false,
          })
        } catch (error) {
          console.error(error)
        }

        if (screenshot.saveAsAFile && screenshot.basePath) {
          try {
            const buffer = Buffer.from(await blob.arrayBuffer())
            const baseName = [
              "mirak",
              dayjs().format("YYYY-MM-DD-HH-mm-ss-SSS"),
              selectedService?.name,
            ]
              .filter((s) => s)
              .join("_")
            const fileName = `${baseName}.png`
            const filePath = path.join(screenshot.basePath, fileName)
            await fs.promises.writeFile(filePath, buffer)
            console.log(`キャプチャを保存しました:`, filePath)
          } catch (error) {
            console.error(error)
          }
        }
      } catch (error) {
        toast.error("キャプチャに失敗しました", {
          autoClose: 2000,
          pauseOnFocusLoss: false,
        })
        console.error(error)
      }
    })()
  }, [screenshotTrigger])

  const setAribSubtitleData = useSetRecoilState(mainPlayerAribSubtitleData)
  const [firstPcr, setFirstPcr] = useState(0)
  const [time, setTime] = useState(0)
  const setTsFirstPcr = useSetRecoilState(mainPlayerTsFirstPcr)
  useThrottleFn(
    (tsPts) => {
      setTsFirstPcr(tsPts)
    },
    1000,
    [firstPcr]
  )
  const setPlayingTime = useSetRecoilState(mainPlayerPlayingTime)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderContext = new VideoRenderer(canvas, {
      preserveDrawingBuffer: true,
    })
    const player = WebChimeraJs.createPlayer()
    player.onLogMessage = (level, message, format) => {
      const parsed = VLCLogFilter(message)
      switch (parsed.category) {
        case "resize":
          console.log(message)
          if (parsed.width && parsed.height) {
            const aspect = width / height
            setAspect(aspect)
            console.log(`Aspect: ${aspect}(${width} / ${height})`)
          }
          break
        case "successfully_opened":
          setIsPlaying(true)
          setSubtitleEnabled(false)
          break
        case "arib_parser_was_destroyed":
          setSubtitleEnabled(false)
          break
        case "arib_data":
          console.log(message)
          if (parsed.data) {
            setPlayingTime(player.time)
            setAribSubtitleData({ data: parsed.data, pts: parsed.pts })
          }
          break
        case "i_pcr":
          if (parsed.i_pcr) {
            setFirstPcr(parsed.pcr_i_first)
          }
          break
        case "received_first_picture":
        case "es_out_program_epg":
          setAudioTracks(
            [...Array(player.audio.count).keys()].map(
              (trackId) => player.audio[trackId]
            )
          )
          break
        case "unable_to_open":
          toast.error("映像の受信に失敗しました")
          setIsPlaying(false)
          break
        case "eof_reached":
          setIsPlaying(false)
          break
        case "end_of_stream":
          renderContext.fillTransparent()
          break
        case "waiting_decoder_fifos_to_empty":
          toast.error("接続が中断されました")
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
    player.volume = volume
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
      <canvas style={{ width, height }} ref={canvasRef}></canvas>
    </div>
  )
})
