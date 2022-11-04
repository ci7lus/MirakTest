import path from "path"
import { CanvasProvider } from "aribb24.js"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { memo, useEffect, useMemo, useRef, useState } from "react"
import { useDebounce } from "react-use"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../../package.json"
import {
  contentPlayerAribSubtitleDataAtom,
  contentPlayerAudioChannelAtom,
  contentPlayerAudioChannelTypeAtom,
  contentPlayerAudioTrackAtom,
  contentPlayerAudioTracksAtom,
  contentPlayerBufferingAtom,
  contentPlayerDisplayingAribSubtitleDataAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPlayingPositionAtom,
  contentPlayerPlayingTimeAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerScreenshotTriggerAtom,
  contentPlayerScreenshotUrlAtom,
  contentPlayerSpeedAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerTotAtom,
  contentPlayerTsFirstPcrAtom,
  contentPlayerVolumeAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
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
import { getAribb24Configuration } from "../../utils/subtitle"
import { VideoRenderer } from "../../utils/videoRenderer"
import { VLCLogFilter } from "../../utils/vlc"

export const CoiledVideoPlayer: React.FC<{
  internalPlayingTimeRef: React.MutableRefObject<number>
  setIsHideController: React.Dispatch<React.SetStateAction<boolean>>
}> = memo(({ internalPlayingTimeRef, setIsHideController }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [size, setSize] = useState<[number, number]>([1920, 1080])
  useDebounce(
    () => {
      console.info("画面サイズ変更:", size)
      setDebouncedSize(size)
    },
    10,
    [size]
  )
  const [debouncedSize, setDebouncedSize] = useState(size)
  const aspect = useMemo(
    () => debouncedSize[0] / debouncedSize[1],
    [debouncedSize]
  )
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

  const [speed, setSpeed] = useRecoilState(contentPlayerSpeedAtom)
  useEffect(() => {
    if (!window.Preload.webchimera.isOk()) return
    window.Preload.webchimera.setSpeed(speed)
    console.info("速度変更:", speed)
  }, [speed])

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
  const program = useRecoilValue(contentPlayerProgramSelector)
  const programRef = useRefFromState(program)
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
  const setAudioChannelType = useSetRecoilState(
    contentPlayerAudioChannelTypeAtom
  )

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
    const baseName = [
      "mirak",
      dayjs().format("YYYY-MM-DD-HH-mm-ss-SSS"),
      service?.name,
    ]
      .filter((s) => s)
      .join("_")
    if (screenshotTrigger < 0) {
      setIsHideController(true)
      setTimeout(
        () =>
          window.Preload.requestWindowScreenshot(baseName)
            .then((dataUrl) => {
              fetch(dataUrl).then(async (res) => {
                const url = URL.createObjectURL(await res.blob())
                setScreenshotUrl(url)
              })
            })
            .finally(() => setIsHideController(false)),
        10
      )
      return
    }
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
          provider.render(
            getAribb24Configuration({
              canvas: subtitleCanvas,
              normalFont: font,
              gaijiFont: font,
            })
          )
          context.drawImage(
            subtitleCanvas,
            0,
            0,
            contentCanvas.width,
            contentCanvas.height
          )
        }
        const blob = await new Promise<Blob | null>((res) =>
          contentCanvas.toBlob(
            (blob) => res(blob),
            screenshot.keepQuality ? "image/png" : "image/jpeg",
            screenshot.keepQuality ? 1 : 0.95
          )
        )
        if (!blob) throw new Error("blob")
        const buffer = await blob.arrayBuffer()
        try {
          await window.Preload.public.writeArrayBufferToClipboard(buffer)
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
            const fileName = `${baseName}.${
              screenshot.keepQuality ? "png" : "jpg"
            }`
            const filePath = path.join(screenshot.basePath, fileName)
            await window.Preload.public.writeFile({
              path: filePath,
              buffer,
            })
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
  const [isAudioSelectedWithDualMono, setIsAudioSelectedWithDualMono] =
    useState(false)
  const isAudioSelectedWithDualMonoRef = useRefFromState(
    isAudioSelectedWithDualMono
  )
  const setBuffering = useSetRecoilState(contentPlayerBufferingAtom)
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
      process.env.NODE_ENV !== "production" ? "-vvv" : "",
      0 <= (experimental.vlcNetworkCaching ?? -1)
        ? `--network-caching=${experimental.vlcNetworkCaching}`
        : "",
      `--avcodec-hw=${
        experimental.isVlcAvCodecHwAny === true ? "any" : "none"
      }`,
      `--http-user-agent=${pkg.productName}/${pkg.version}`,
    ].filter((s) => s)
    console.info("VLC Args:", args)
    window.Preload.webchimera.setup(args)
    let pcr_i_first = 0
    let last = 0
    window.Preload.webchimera.onTimeChanged((time) => {
      if (100 < Math.abs(time - last)) {
        setPlayingTime(time)
        last = time
      }
      internalPlayingTimeRef.current = time
    })
    let isCustomized = false
    window.Preload.webchimera.onLogMessage((_level, message) => {
      const parsed = VLCLogFilter(message)
      switch (parsed.category) {
        case "resize":
          console.debug(message)
          if (parsed.width && parsed.height) {
            const { width, height } = parsed
            setSize([width, height])
            console.info(`Aspect: ${width / height}(${width} / ${height})`)
          }
          break
        case "arib_parser_was_destroyed":
          if (isCustomized) {
            window.Preload.webchimera.setSubtitleTrack(1)
          } else {
            setIsSubtitleEnabled(false)
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
        case "configured_with": {
          console.debug(message)
          isCustomized = parsed.isCustomized || false
          break
        }
        case "audio_channel_updated":
        case "received_first_picture":
        case "es_out_program_epg":
        case "PMTCallBack_called_for_program": {
          // ほどほどの頻度、番組切り替わり後など
          console.debug(message)
          setAudioTracks(window.Preload.webchimera.getAudioTracks())
          const audioChannel = window.Preload.webchimera.getAudioChannel()
          if (experimental.isDualMonoAutoAdjustEnabled) {
            if (programRef.current?.audios?.[0]?.componentType === 2) {
              // デュアルモノのため1->3
              if (!isAudioSelectedWithDualMonoRef.current) {
                console.info("デュアルモノを検出しました")
                if (audioChannelRef.current === 1) {
                  setAudioChannel(3)
                  setIsAudioSelectedWithDualMono(true)
                }
              }
            } else {
              // デュアルモノではない
              if (isAudioSelectedWithDualMonoRef.current) {
                console.info("デュアルモノを抜けます")
                setIsAudioSelectedWithDualMono(false)
                // デュアルモノになっているため3->1
                if (audioChannelRef.current === 3) {
                  setAudioChannel(1)
                }
              }
            }
            const selectedAudioChannel = audioChannelRef.current
            if (audioChannel !== 0 && audioChannel !== selectedAudioChannel) {
              console.info(
                "オーディオチャンネルを整合します:",
                audioChannel,
                "->",
                selectedAudioChannel
              )
              window.Preload.webchimera.setAudioChannel(selectedAudioChannel)
            }
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
        case "playback_too_late": {
          // 変なデコードをして再生が遅延しているとき
          console.debug(message)
          if (experimental.isSurroundAutoAdjustEnabeld) {
            console.info(
              "再生が遅延しています。サラウンドの可能性があるためオーディオをリセットします"
            )
            window.Preload.webchimera.setAudioTrack(0)
            window.Preload.webchimera.setAudioTrack(1)
          }
          break
        }
        case "surround-to-surround": {
          console.debug(message)
          console.info("サラウンドを検出しました")
          setAudioChannelType("surround")
          if (experimental.isSurroundAutoAdjustEnabeld) {
            if (window.Preload.webchimera.getAudioChannel() === 0) {
              console.info(
                "オーディオチャンネルが0のためサラウンド中は2に整合します"
              )
              setAudioChannel(2)
            } else {
              setAudioChannel(window.Preload.webchimera.getAudioChannel())
            }
          }
          break
        }
        case "stereo-to-stereo": {
          console.debug(message)
          console.info("ステレオを検出しました")
          setAudioChannelType("stereo")
          if (experimental.isSurroundAutoAdjustEnabeld) {
            setAudioChannel(window.Preload.webchimera.getAudioChannel())
          }
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
      if (!isCustomized) {
        setIsSubtitleEnabled(false)
      }
      setAribSubtitleData(null)
      setAudioTrack(1)
      if (
        isAudioSelectedWithDualMonoRef.current &&
        audioChannelRef.current === 3
      ) {
        setIsAudioSelectedWithDualMono(false)
        setAudioChannel(1)
      }
      setIsErrorEncounted(false)
      setIsAudioSelectedWithDualMono(false)
      setSpeed(1)
    })
    window.Preload.webchimera.onEncounteredError(() => {
      window.Preload.public.showNotification({
        title: "映像の受信に失敗しました",
      })
      renderContext.fillTransparent()
      setIsErrorEncounted(true)
    })
    window.Preload.webchimera.onBuffering((percentage) => {
      setBuffering(percentage)
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
    return () => {
      window.Preload.webchimera.destroy()
    }
  }, [])
  return (
    <canvas
      className={clsx("object-contain", "w-full", "h-full", "block")}
      style={{ aspectRatio: aspect.toString() }}
      width={debouncedSize[0]}
      height={debouncedSize[1]}
      ref={canvasRef}
    />
  )
})
