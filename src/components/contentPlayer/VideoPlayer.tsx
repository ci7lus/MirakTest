import path from "path"
import { CanvasProvider } from "aribb24.js"
import dayjs from "dayjs"
import React, { memo, useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../../package.json"
import {
  contentPlayerAribSubtitleDataAtom,
  contentPlayerAudioChannelAtom,
  contentPlayerAudioTrackAtom,
  contentPlayerAudioTracksAtom,
  contentPlayerDisplayingAribSubtitleDataAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPlayingPositionAtom,
  contentPlayerPlayingTimeAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerScreenshotTriggerAtom,
  contentPlayerScreenshotUrlAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerTotAtom,
  contentPlayerTsFirstPcrAtom,
  contentPlayerVolumeAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerServiceSelector,
  contentPlayerUrlSelector,
} from "../../atoms/contentPlayerSelectors"
import {
  experimentalSetting,
  screenshotSetting,
  subtitleSetting,
} from "../../atoms/settings"
import { SUBTITLE_DEFAULT_FONT } from "../../constants/font"
import { useRefFromState } from "../../hooks/ref"
import { VideoRenderer } from "../../utils/videoRenderer"
import { VLCLogFilter } from "../../utils/vlc"

export const CoiledVideoPlayer: React.VFC<{}> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [aspect, setAspect] = useState(16 / 9)
  const [width, setWidth] = useState(1280)
  const height = Math.ceil(width / aspect)

  useEffect(() => {
    if (process.platform === "darwin") {
      window.Preload.public.setWindowAspect(aspect)
    }
  }, [aspect])

  const url = useRecoilValue(contentPlayerUrlSelector)
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    if (url) {
      window.Preload.webchimera.play(url)
      console.info("URL再生:", url)
    } else {
      window.Preload.webchimera.stop()
      console.info("再生停止")
    }
  }, [url])
  const [isPlaying, setIsPlaying] = useRecoilState(contentPlayerIsPlayingAtom)
  const [isErrorEncounted, setIsErrorEncounted] = useState(false)
  useEffect(() => {
    if (!window.Preload.webchimera.isOk() || !url) {
      return
    }
    if (isSeekable && window.Preload.webchimera.hasVout()) {
      console.info("ポーズ切り替え")
      window.Preload.webchimera.togglePause()
    } else {
      if (
        isPlaying &&
        (!window.Preload.webchimera.isPlaying() ||
          (!window.Preload.webchimera.hasVout() && !isErrorEncounted))
      ) {
        window.Preload.webchimera.play(url)
        console.info("再生開始", url)
      } else if (!isPlaying) {
        window.Preload.webchimera.stop()
        console.info("再生停止")
      }
    }
  }, [isPlaying])

  const volume = useRecoilValue(contentPlayerVolumeAtom)
  const volumeRef = useRefFromState(volume)
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    window.Preload.webchimera.setVolume(volume)
    console.info("音量変更:", volume)
  }, [volume])

  const [isSubtitleEnabled, setIsSubtitleEnabled] = useRecoilState(
    contentPlayerSubtitleEnabledAtom
  )
  useEffect(() => {
    if (!window.Preload.webchimera.isOk() || firstPcr !== 0) return
    window.Preload.webchimera.setSubtitleTrack(Number(isSubtitleEnabled))
    console.info("字幕変更:", Number(isSubtitleEnabled))
  }, [isSubtitleEnabled])
  const [audioChannel, setAudioChannel] = useRecoilState(
    contentPlayerAudioChannelAtom
  )
  const audioChannelRef = useRefFromState(audioChannel)
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    window.Preload.webchimera.setAudioChannel(audioChannel)
    console.info("オーディオチャンネル変更:", audioChannel)
  }, [audioChannel])

  const [audioTrack, setAudioTrack] = useRecoilState(
    contentPlayerAudioTrackAtom
  )
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    window.Preload.webchimera.setAudioTrack(audioTrack)
    console.info("オーディオトラック変更:", audioTrack)
  }, [audioTrack])
  const setAudioTracks = useSetRecoilState(contentPlayerAudioTracksAtom)

  // スクリーンショットフォルダ初期設定
  const [screenshot, setScreenshot] = useRecoilState(screenshotSetting)
  useEffect(() => {
    if (screenshot.basePath) return
    window.Preload.public.requestAppPath("pictures").then(async (pictures) => {
      if (!pictures) return
      const isExists = await window.Preload.public.isDirectoryExists(pictures)
      if (isExists) {
        setScreenshot({ ...screenshot, basePath: pictures })
        console.info("スクリーンショット用パス:", pictures)
      } else {
        console.warn("スクリーンショット用パスが存在しませんでした:", pictures)
      }
    })
  }, [])
  const service = useRecoilValue(contentPlayerServiceSelector)

  const setting = useRecoilValue(subtitleSetting)

  const displayingAribSubtitleData = useRecoilValue(
    contentPlayerDisplayingAribSubtitleDataAtom
  )

  // スクリーンショットフォルダ初期設定
  const screenshotTrigger = useRecoilValue(contentPlayerScreenshotTriggerAtom)
  const setScreenshotUrl = useSetRecoilState(contentPlayerScreenshotUrlAtom)
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
        if (
          displayingAribSubtitleData &&
          screenshot.includeSubtitle === true &&
          isSubtitleEnabled === true
        ) {
          const subtitleCanvas = document.createElement("canvas")
          subtitleCanvas.height = contentCanvas.height
          subtitleCanvas.width = contentCanvas.width
          const provider = new CanvasProvider(displayingAribSubtitleData, 0)
          const font = setting.font || SUBTITLE_DEFAULT_FONT
          provider.render({
            canvas: subtitleCanvas,
            useStrokeText: true,
            keepAspectRatio: true,
            normalFont: font,
            gaijiFont: font,
            drcsReplacement: true,
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
        const buffer = await blob.arrayBuffer()
        try {
          window.Preload.public.writeArrayBufferToClipboard(buffer)
        } catch (error) {
          console.error(error)
        }

        try {
          const url = URL.createObjectURL(blob)
          setScreenshotUrl(url)
        } catch (error) {
          console.error(error)
        }

        if (screenshot.saveAsAFile && screenshot.basePath) {
          try {
            const baseName = [
              "mirak",
              dayjs().format("YYYY-MM-DD-HH-mm-ss-SSS"),
              service?.name,
            ]
              .filter((s) => s)
              .join("_")
            const fileName = `${baseName}.png`
            const filePath = path.join(screenshot.basePath, fileName)
            await window.Preload.public.writeFile(filePath, buffer)
            console.info(`キャプチャを保存しました:`, filePath)
            window.Preload.public.showNotification(
              {
                title: "スクリーンショットを撮影しました",
                body: `${fileName} (クリックで開く)`,
              },
              filePath
            )
          } catch (error) {
            console.error(error)
          }
        } else {
          window.Preload.public.showNotification({
            title: "スクリーンショットを撮影しました",
          })
        }
      } catch (error) {
        window.Preload.public.showNotification({
          title: "スクリーンショットの撮影に失敗しました",
          body: error instanceof Error ? error.message : undefined,
        })
        console.error(error)
      }
    })()
  }, [screenshotTrigger])

  const setAribSubtitleData = useSetRecoilState(
    contentPlayerAribSubtitleDataAtom
  )
  const [firstPcr, setFirstPcr] = useRecoilState(contentPlayerTsFirstPcrAtom)
  const setPlayingTime = useSetRecoilState(contentPlayerPlayingTimeAtom)
  const setTot = useSetRecoilState(contentPlayerTotAtom)
  const [position, setPosition] = useState(0)
  const setPlayingPosition = useSetRecoilState(contentPlayerPlayingPositionAtom)
  const positionUpdate = useRecoilValue(contentPlayerPositionUpdateTriggerAtom)
  const [isSeekable, setIsSeekable] = useRecoilState(
    contentPlayerIsSeekableAtom
  )
  const isSeekableRef = useRefFromState(isSeekable)
  useEffect(() => setPlayingPosition(position), [position])
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    window.Preload.webchimera.setPosition(positionUpdate)
    console.info(`ユーザー位置更新:`, positionUpdate)
  }, [positionUpdate])
  const experimental = useRecoilValue(experimentalSetting)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderContext = new VideoRenderer(canvas, {
      preserveDrawingBuffer: true,
    })
    const args = [
      0 <= (experimental.vlcNetworkCaching ?? -1)
        ? `--network-caching=${experimental.vlcNetworkCaching}`
        : "",
      experimental.isVlcAvCodecHwAny === true ? "--avcodec-hw=any" : "",
      `--http-user-agent=${pkg.productName}/${pkg.version}`,
    ].filter((s) => s)
    console.info("VLC Args:", args)
    window.Preload.webchimera.setup(args)
    let pcr_i_first = 0
    let last = 0
    window.Preload.webchimera.onTimeChanged((time) => {
      if (300 < Math.abs(time - last)) {
        setPlayingTime(time)
        last = time
      }
    })
    window.Preload.webchimera.onLogMessage((_level, message) => {
      const parsed = VLCLogFilter(message)
      switch (parsed.category) {
        case "resize":
          console.debug(message)
          if (parsed.width && parsed.height) {
            const aspect = width / height
            setAspect(aspect)
            console.info(`Aspect: ${aspect}(${width} / ${height})`)
          }
          break
        case "arib_parser_was_destroyed":
          if (pcr_i_first === 0) {
            setIsSubtitleEnabled(false)
          } else {
            window.Preload.webchimera.setSubtitleTrack(1)
          }
          break
        case "arib_data":
          // 中頻度
          console.debug(message)
          setFirstPcr(pcr_i_first)
          if (parsed.data) {
            setAribSubtitleData({ data: parsed.data, pts: parsed.pts })
          }
          break
        case "i_pcr":
          // 超高頻度
          if (parsed.i_pcr) {
            pcr_i_first = parsed.pcr_i_first
          }
          break
        case "tot":
          // 5sおき
          if (parsed.tot) {
            setTot(parsed.tot)
          }
          break
        case "received_first_picture":
        case "es_out_program_epg":
        case "PMTCallBack_called_for_program":
        case "discontinuity_received_0": {
          // ほどほどの頻度
          console.debug(message)
          setAudioTracks(window.Preload.webchimera.getAudioTracks())
          const audioChannel = window.Preload.webchimera.getAudioChannel()
          if (audioChannel !== audioChannelRef.current) {
            setAudioChannel(audioChannel)
          }
          if (
            pcr_i_first !== 0 &&
            window.Preload.webchimera.getSubtitleTrack() !== 1
          ) {
            window.Preload.webchimera.setSubtitleTrack(1)
          }
          window.Preload.webchimera.setVolume(volumeRef.current)
          break
        }
        case "unknown":
          console.debug(message)
          break
        default:
          break
      }
    })
    window.Preload.webchimera.onFrameReady(
      (frame, width, height, uOffset, vOffset) => {
        renderContext.render(frame, width, height, uOffset, vOffset)
      }
    )
    window.Preload.webchimera.onMediaChanged(() => {
      setIsPlaying(true)
      if (pcr_i_first === 0) {
        setIsSubtitleEnabled(false)
      }
      setAribSubtitleData(null)
      setAudioChannel(0)
      setAudioTrack(1)
      setIsErrorEncounted(false)
    })
    window.Preload.webchimera.onEncounteredError(() => {
      window.Preload.public.showNotification({
        title: "映像の受信に失敗しました",
      })
      renderContext.fillTransparent()
      setIsErrorEncounted(true)
    })
    window.Preload.webchimera.onStopped(() => {
      setIsPlaying(false)
    })
    window.Preload.webchimera.onEndReached(() => {
      setIsPlaying(false)
      if (isSeekableRef.current === false) {
        window.Preload.public.showNotification({
          title: "映像の受信が中断されました",
        })
      }
    })
    window.Preload.webchimera.onPaused(() => {
      setIsPlaying(false)
    })
    window.Preload.webchimera.onPlaying(() => {
      setIsPlaying(true)
    })
    window.Preload.webchimera.onSeekableChanged((seekable) => {
      setIsSeekable(seekable)
    })
    window.Preload.webchimera.onPositionChanged((position) => {
      setPosition(position)
    })
    window.Preload.webchimera.setVolume(volume)
    const onResize = () => {
      if (!containerRef.current) return
      setWidth(containerRef.current.clientWidth)
    }
    window.addEventListener("resize", onResize)
    onResize()
    return () => {
      window.removeEventListener("resize", onResize)
      window.Preload.webchimera.destroy()
    }
  }, [])
  return (
    <div className="w-full" ref={containerRef}>
      <canvas style={{ width, height }} ref={canvasRef}></canvas>
    </div>
  )
})
