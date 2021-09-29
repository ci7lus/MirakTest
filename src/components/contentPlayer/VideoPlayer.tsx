import fs from "fs"
import path from "path"
import { CanvasProvider } from "aribb24.js"
import dayjs from "dayjs"
import { nativeImage, remote } from "electron"
import React, { memo, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useThrottleFn } from "react-use"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import WebChimeraJs from "webchimera.js"
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
  contentPlayerSubtitleEnabledAtom,
  contentPlayerTsFirstPcrAtom,
  contentPlayerVolumeAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerServiceSelector,
  contentPlayerUrlSelector,
} from "../../atoms/contentPlayerSelectors"
import { screenshotSetting } from "../../atoms/settings"
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
    const remoteWindow = remote.getCurrentWindow()
    remoteWindow.setAspectRatio(aspect)
  }, [aspect])

  const playerRef = useRef<WebChimeraJs.Player | null>(null)

  const url = useRecoilValue(contentPlayerUrlSelector)
  useEffect(() => {
    if (!playerRef.current) return
    if (url) {
      playerRef.current.play(url)
      console.info("URL再生:", url)
    } else {
      playerRef.current.stop()
      console.info("再生停止")
    }
  }, [url])
  const [isPlaying, setIsPlaying] = useRecoilState(contentPlayerIsPlayingAtom)
  const [isErrorEncounted, setIsErrorEncounted] = useState(false)
  useEffect(() => {
    const player = playerRef.current
    if (!player || !url) return
    if (isSeekable && player.input.hasVout) {
      console.info("ポーズ切り替え")
      player.togglePause()
    } else {
      if (
        (isPlaying && !player.playing) ||
        (!player.input.hasVout && !isErrorEncounted)
      ) {
        player.play(url)
        console.info("再生開始", url)
      } else if (!isPlaying) {
        player.stop()
        console.info("再生停止")
      }
    }
  }, [isPlaying])

  const volume = useRecoilValue(contentPlayerVolumeAtom)
  const volumeRef = useRefFromState(volume)
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.volume = volume
    console.info("音量変更:", volume)
  }, [volume])

  const [isSubtitleEnabled, setIsSubtitleEnabled] = useRecoilState(
    contentPlayerSubtitleEnabledAtom
  )
  useEffect(() => {
    if (!playerRef.current || firstPcr !== 0) return
    playerRef.current.subtitles.track = Number(isSubtitleEnabled)
    console.info("字幕変更:", Number(isSubtitleEnabled))
  }, [isSubtitleEnabled])
  const [audioChannel, setAudioChannel] = useRecoilState(
    contentPlayerAudioChannelAtom
  )
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.audio.channel = audioChannel
    console.info("オーディオチャンネル変更:", audioChannel)
  }, [audioChannel])

  const [audioTrack, setAudioTrack] = useRecoilState(
    contentPlayerAudioTrackAtom
  )
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.audio.track = audioTrack
    console.info("オーディオトラック変更:", audioTrack)
  }, [audioTrack])
  const setAudioTracks = useSetRecoilState(contentPlayerAudioTracksAtom)

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
        console.info("スクリーンショット用パス:", pictures)
      })
      .catch(console.error)
  }, [])
  const service = useRecoilValue(contentPlayerServiceSelector)

  const displayingAribSubtitleData = useRecoilValue(
    contentPlayerDisplayingAribSubtitleDataAtom
  )

  // スクリーンショットフォルダ初期設定
  const screenshotTrigger = useRecoilValue(contentPlayerScreenshotTriggerAtom)
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
          provider.render({
            canvas: subtitleCanvas,
            useStrokeText: true,
            keepAspectRatio: true,
            normalFont: "'Rounded M+ 1m for ARIB'",
            gaijiFont: "'Rounded M+ 1m for ARIB'",
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
        const buffer = Buffer.from(await blob.arrayBuffer())
        try {
          const image = nativeImage.createFromBuffer(buffer)
          remote.clipboard.writeImage(image, "clipboard")
          toast.info("キャプチャしました", {
            autoClose: 2000,
            pauseOnFocusLoss: false,
          })
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
            await fs.promises.writeFile(filePath, buffer)
            console.info(`キャプチャを保存しました:`, filePath)
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

  const setAribSubtitleData = useSetRecoilState(
    contentPlayerAribSubtitleDataAtom
  )
  const [firstPcr, setFirstPcr] = useState(0)
  const firstPcrRef = useRefFromState(firstPcr)
  const setTsFirstPcr = useSetRecoilState(contentPlayerTsFirstPcrAtom)
  useThrottleFn(
    (tsPts) => {
      setTsFirstPcr(tsPts)
    },
    1000,
    [firstPcr]
  )
  const setPlayingTime = useSetRecoilState(contentPlayerPlayingTimeAtom)
  const [position, setPosition] = useState(0)
  const setPlayingPosition = useSetRecoilState(contentPlayerPlayingPositionAtom)
  const positionUpdate = useRecoilValue(contentPlayerPositionUpdateTriggerAtom)
  const [isSeekable, setIsSeekable] = useRecoilState(
    contentPlayerIsSeekableAtom
  )
  const isSeekableRef = useRefFromState(isSeekable)
  useEffect(() => setPlayingPosition(position), [position])
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    player.position = positionUpdate
    console.info(`ユーザー位置更新:`, positionUpdate)
  }, [positionUpdate])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const renderContext = new VideoRenderer(canvas, {
      preserveDrawingBuffer: true,
    })
    const player = WebChimeraJs.createPlayer()
    player.onLogMessage = (_level, message) => {
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
          if (firstPcrRef.current === 0) {
            setIsSubtitleEnabled(false)
          } else {
            player.subtitles.track = 1
          }
          break
        case "arib_data":
          console.debug(message)
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
        case "PMTCallBack_called_for_program":
        case "discontinuity_received_0":
          setAudioTracks(
            [...Array(player.audio.count).keys()].map(
              (trackId) => player.audio[trackId]
            )
          )
          if (firstPcrRef.current !== 0 && player.subtitles.track !== 1) {
            player.subtitles.track = 1
          }
          player.volume = volumeRef.current
          break
        case "unknown":
          console.debug(message)
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
    player.onMediaChanged = () => {
      setIsPlaying(true)
      if (firstPcrRef.current === 0) {
        setIsSubtitleEnabled(false)
      }
      setAribSubtitleData(null)
      setAudioChannel(0)
      setAudioTrack(1)
      setIsErrorEncounted(false)
    }
    player.onEncounteredError = () => {
      toast.error("映像の受信に失敗しました")
      renderContext.fillTransparent()
      setIsErrorEncounted(true)
    }
    player.onStopped = () => {
      setIsPlaying(false)
    }
    player.onEndReached = () => {
      setIsPlaying(false)
      if (isSeekableRef.current === false) {
        toast.error("映像の受信が中断されました")
      }
    }
    player.onPaused = () => {
      setIsPlaying(false)
    }
    player.onPlaying = () => {
      setIsPlaying(true)
    }
    player.onSeekableChanged = (seekable) => {
      setIsSeekable(seekable)
    }
    player.onPositionChanged = (position) => {
      setPosition(position)
    }
    player.volume = volume
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
