import React, { useEffect, useRef, useState } from "react"
import { remote } from "electron"
import { CommentOpacitySlider } from "./controllers/CommentOpacitySlider"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { mirakurunPrograms, mirakurunServices } from "../../atoms/mirakurun"
import {
  mainPlayerAudioChannel,
  mainPlayerAudioTrack,
  mainPlayerAudioTracks,
  mainPlayerCommentOpacity,
  mainPlayerLastSelectedServiceId,
  mainPlayerScreenshotTrigger,
  mainPlayerSelectedService,
  mainPlayerSubtitleEnabled,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { useDebounce } from "react-use"
import { CoiledScreenshotButton } from "./controllers/ScreenshotButton"
import { ServiceSelector } from "./controllers/ServiceSelector"
import { VolumeSlider } from "./controllers/VolumeSlider"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { SubtitleToggleButton } from "./controllers/SubtitleToggleButton"
import { useRefFromState } from "../../hooks/ref"
import { controllerSetting, experimentalSetting } from "../../atoms/settings"

export const CoiledController: React.VFC<{}> = () => {
  const [isVisible, setIsVisible] = useState(false)

  const [lastCurMoved, setLastCurMoved] = useState(0)
  useDebounce(
    () => {
      setIsVisible(false)
    },
    2500,
    [lastCurMoved]
  )

  const programs = useRecoilValue(mirakurunPrograms)
  const services = useRecoilValue(mirakurunServices)
  const [selectedService, setSelectedService] = useRecoilState(
    mainPlayerSelectedService
  )

  const [subtitleEnabled, setSubtitleEnabled] = useRecoilState(
    mainPlayerSubtitleEnabled
  )
  const [volume, setVolume] = useRecoilState(mainPlayerVolume)
  const [commentOpacity, setCommentOpacity] = useRecoilState(
    mainPlayerCommentOpacity
  )

  const [audioTrack, setAudioTrack] = useRecoilState(mainPlayerAudioTrack)
  const audioTracks = useRecoilValue(mainPlayerAudioTracks)

  const [isServiceNameShowing, setIsServiceNameShowing] = useState(false)
  const lastServiceId = useRecoilValue(mainPlayerLastSelectedServiceId)
  useEffect(() => {
    if (!lastServiceId) return
    setIsServiceNameShowing(true)
    const timer = setTimeout(() => setIsServiceNameShowing(false), 5 * 1000)
    return () => clearInterval(timer)
  }, [lastServiceId])
  const [audioChannel, setAudioChannel] = useRecoilState(mainPlayerAudioChannel)

  const componentRef = useRef<HTMLDivElement>(null)

  const [mouse, setMouse] = useState([0, 0])
  const mouseRef = useRefFromState(mouse)
  const animId = useRef<number>(0)

  const currentWindow = remote.getCurrentWindow()

  const moveWindow = () => {
    const [mouseX, mouseY] = mouseRef.current
    const { x, y } = remote.screen.getCursorScreenPoint()
    const xPos = x - mouseX
    const yPos = y - mouseY - window.outerHeight + window.innerHeight
    if (0 < xPos && 0 < yPos) {
      currentWindow.setPosition(xPos, yPos)
    }
    animId.current = requestAnimationFrame(moveWindow)
  }
  // 移動キャンセル
  const cancelMoveWindow = () =>
    requestAnimationFrame(() => cancelAnimationFrame(animId.current))

  const experimental = useRecoilValue(experimentalSetting)

  const controller = useRecoilValue(controllerSetting)

  // キーボードショートカット
  const setScreenshotTrigger = useSetRecoilState(mainPlayerScreenshotTrigger)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && e.metaKey === true) {
        setScreenshotTrigger(performance.now())
      } else if (e.key === "ArrowUp") {
        // 音量+10
        setVolume((volume) =>
          controller.volumeRange[1] - 10 < volume
            ? controller.volumeRange[1]
            : volume + 10
        )
      } else if (e.key === "ArrowDown") {
        // 音量-10
        setVolume((volume) =>
          volume < controller.volumeRange[0] + 10
            ? controller.volumeRange[0]
            : volume - 10
        )
      } else if (e.key === "m") {
        setVolume((volume) => (0 < volume ? 0 : 100))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <div
      ref={componentRef}
      className="w-full h-full flex flex-col justify-between"
      onMouseMove={() => {
        setIsVisible(true)
        setLastCurMoved(new Date().getSeconds())
      }}
      onMouseLeave={() => setIsVisible(false)}
      onDoubleClick={() => {
        if (!currentWindow.fullScreenable) return
        currentWindow.setFullScreen(!currentWindow.isFullScreen())
      }}
      onMouseDown={(e) => {
        if (
          e.button === 2 ||
          !document.hasFocus() ||
          !experimental.isWindowDragMoveEnabled
        )
          return
        setMouse([e.clientX, e.clientY])
        requestAnimationFrame(moveWindow)
      }}
      onMouseUp={cancelMoveWindow}
      onContextMenu={cancelMoveWindow}
      onWheel={(e) => {
        if (e.deltaX !== 0) return
        setIsVisible(true)
        setLastCurMoved(new Date().getSeconds())
        setVolume((volume) => {
          const target = volume + e.deltaY
          if (target < controller.volumeRange[0]) {
            return controller.volumeRange[0]
          } else if (controller.volumeRange[1] < target) {
            return controller.volumeRange[1]
          } else {
            return target
          }
        })
      }}
    >
      <div
        className={`select-none transition-opacity duration-150 ease-in-out p-4 ${
          isServiceNameShowing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-4xl text-green-400 serviceNameOutline">
          {[
            selectedService?.remoteControlKeyId || selectedService?.serviceId,
            selectedService?.name,
          ]
            .filter((s) => s !== undefined)
            .join(" ")}
        </div>
      </div>
      <div
        className={`flex space-x-2 px-2 pr-4 overflow-auto text-gray-100 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-black bg-opacity-50 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onDoubleClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          isProgramDetailEnabled={
            experimental.isProgramDetailInServiceSelectorEnabled
          }
        />
        <VolumeSlider
          volume={volume}
          setVolume={setVolume}
          min={controller.volumeRange[0]}
          max={controller.volumeRange[1]}
        />
        <AudioChannelSelector
          audioChannel={audioChannel}
          setAudioChannel={setAudioChannel}
        />
        {3 <= audioTracks.length && (
          <AudioTrackSelector
            audioTrack={audioTrack}
            setAudioTrack={setAudioTrack}
            audioTracks={audioTracks}
          />
        )}
        <SubtitleToggleButton
          subtitleEnabled={subtitleEnabled}
          setSubtitleEnabled={setSubtitleEnabled}
        />
        <CoiledScreenshotButton />
        <CommentOpacitySlider
          commentOpacity={commentOpacity}
          setCommentOpacity={setCommentOpacity}
        />
        <div className="pr-2" />
      </div>
    </div>
  )
}
