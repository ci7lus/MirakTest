import fs from "fs"
import path from "path"
import { CanvasProvider } from "aribb24.js"
import dayjs from "dayjs"
import { nativeImage, remote } from "electron"
import React, { memo, useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import WebChimeraJs from "webchimera.js"
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
import { remoteWindow } from "../../utils/remote"
import { VideoRenderer } from "../../utils/videoRenderer"
import { VLCLogFilter } from "../../utils/vlc"

export const CoiledVideoPlayer: React.VFC<{}> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [aspect, setAspect] = useState(16 / 9)
  const [width, setWidth] = useState(1280)
  const height = Math.ceil(width / aspect)

  useEffect(() => {
    if (process.platform !== "win32") {
      remoteWindow.setAspectRatio(aspect)
    }
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
  }, [url, playerRef.current])
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
        isPlaying &&
        (!player.playing || (!player.input.hasVout && !isErrorEncounted))
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
        const buffer = Buffer.from(await blob.arrayBuffer())
        try {
          const image = nativeImage.createFromBuffer(buffer)
          remote.clipboard.writeImage(image, "clipboard")
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
            await fs.promises.writeFile(filePath, buffer)
            console.info(`キャプチャを保存しました:`, filePath)
            const notify = new remote.Notification({
              title: "スクリーンショットを撮影しました",
              body: `${fileName} (クリックで開く)`,
            })
            notify.show()
            notify.on("click", () => {
              remote.shell.openPath(filePath)
            })
          } catch (error) {
            console.error(error)
          }
        } else {
          new remote.Notification({
            title: "スクリーンショットを撮影しました",
          }).show()
        }
      } catch (error) {
        new remote.Notification({
          title: "スクリーンショットの撮影に失敗しました",
          body: error instanceof Error ? error.message : undefined,
        }).show()
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
    const player = playerRef.current
    if (!player) return
    player.position = positionUpdate
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
      `--http-referrer=${pkg.repository.url}`,
    ].filter((s) => s)
    console.info("VLC Args:", args)
    const player = WebChimeraJs.createPlayer(args)
    let pcr_i_first = 0
    let last = 0
    player.onTimeChanged = (time) => {
      if (770 < Math.abs(time - last)) {
        setPlayingTime(time)
        last = time
      }
    }
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
          if (pcr_i_first === 0) {
            setIsSubtitleEnabled(false)
          } else {
            player.subtitles.track = 1
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
        case "discontinuity_received_0":
          // ほどほどの頻度
          console.debug(message)
          setAudioTracks(
            [...Array(player.audio.count).keys()].map(
              (trackId) => player.audio[trackId]
            )
          )
          if (pcr_i_first !== 0 && player.subtitles.track !== 1) {
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
      if (pcr_i_first === 0) {
        setIsSubtitleEnabled(false)
      }
      setAribSubtitleData(null)
      setAudioChannel(0)
      setAudioTrack(1)
      setIsErrorEncounted(false)
    }
    player.onEncounteredError = () => {
      new remote.Notification({
        title: "映像の受信に失敗しました",
      }).show()
      renderContext.fillTransparent()
      setIsErrorEncounted(true)
    }
    player.onStopped = () => {
      setIsPlaying(false)
    }
    player.onEndReached = () => {
      setIsPlaying(false)
      if (isSeekableRef.current === false) {
        new remote.Notification({
          title: "映像の受信が中断されました",
        }).show()
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
      playerRef.current = null
    }
  }, [])
  return (
    <div className="w-full" ref={containerRef}>
      <canvas style={{ width, height }} ref={canvasRef}></canvas>
    </div>
  )
})
