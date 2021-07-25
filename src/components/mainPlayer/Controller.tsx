import clsx from "clsx"
import { remote } from "electron"
import React, { useEffect, useRef, useState } from "react"
import { PauseCircle, PlayCircle } from "react-feather"
import { useDebounce } from "react-use"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  mainPlayerAudioChannel,
  mainPlayerAudioTrack,
  mainPlayerAudioTracks,
  mainPlayerCommentOpacity,
  mainPlayerIsPlaying,
  mainPlayerIsSeekable,
  mainPlayerLastSelectedServiceId,
  mainPlayerPlayingPosition,
  mainPlayerPositionUpdateTrigger,
  mainPlayerScreenshotTrigger,
  mainPlayerSelectedService,
  mainPlayerSelectedServiceLogoUrl,
  mainPlayerSubtitleEnabled,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { mirakurunServices } from "../../atoms/mirakurun"
import { controllerSetting, experimentalSetting } from "../../atoms/settings"
import { useRefFromState } from "../../hooks/ref"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { CommentOpacitySlider } from "./controllers/CommentOpacitySlider"
import { PlayToggleButton } from "./controllers/PlayToggleButton"
import { PositionSlider } from "./controllers/PositionSlider"
import { CoiledScreenshotButton } from "./controllers/ScreenshotButton"
import { ServiceSelector } from "./controllers/ServiceSelector"
import { SubtitleToggleButton } from "./controllers/SubtitleToggleButton"
import { VolumeSlider } from "./controllers/VolumeSlider"

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

  const [isPlaying, setIsPlaying] = useRecoilState(mainPlayerIsPlaying)
  const position = useRecoilValue(mainPlayerPlayingPosition)
  const setPosition = useSetRecoilState(mainPlayerPositionUpdateTrigger)
  const isSeekable = useRecoilValue(mainPlayerIsSeekable)

  const services = useRecoilValue(mirakurunServices)
  const [selectedService, setSelectedService] = useRecoilState(
    mainPlayerSelectedService
  )
  const serviceLogoUrl = useRecoilValue(mainPlayerSelectedServiceLogoUrl)

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
      if (e.key === "s" && (e.metaKey === true || e.ctrlKey === true)) {
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

  const [isPlayButtonShowing, setIsPlayButtonShowing] = useState(false)
  const isPlayingUpdateTimeout = useRef<NodeJS.Timeout>()
  useEffect(() => {
    setIsPlayButtonShowing(true)
    isPlayingUpdateTimeout.current &&
      clearTimeout(isPlayingUpdateTimeout.current)
    isPlayingUpdateTimeout.current = setTimeout(
      () => setIsPlayButtonShowing(false),
      1000
    )
  }, [isPlaying])

  return (
    <div
      ref={componentRef}
      className="w-full h-full relative"
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
        className={clsx(
          "absolute w-full h-full flex flex-col justify-between",
          !isVisible && "cursor-none"
        )}
      >
        <div
          className={`select-none transition-opacity duration-150 ease-in-out p-4 ${
            isServiceNameShowing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-4xl text-green-400 flex items-center space-x-2 serviceNameOutline">
            {serviceLogoUrl && (
              <img
                className="h-6 rounded-md overflow-hidden"
                src={serviceLogoUrl}
              />
            )}
            <span>
              {[
                selectedService?.remoteControlKeyId ||
                  selectedService?.serviceId,
                selectedService?.name,
              ]
                .filter((s) => s !== undefined)
                .join(" ")}
            </span>
          </div>
        </div>
        <div
          className={`flex flex-col space-y-2 text-gray-100 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-black bg-opacity-50 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isSeekable && (
            <div className="flex space-x-4 px-2 pr-4">
              <PlayToggleButton
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
              <PositionSlider position={position} setPosition={setPosition} />
            </div>
          )}
          <div className="flex space-x-2 px-2 pr-4 overflow-auto">
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
        <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
          <button
            type="button"
            className={clsx(
              "focus:outline-none transition-opacity duration-150 ease-in-out",
              isPlayButtonShowing || !isPlaying
                ? "opacity-80 cursor-pointer pointer-events-auto"
                : "opacity-0",
              isPlaying && "animate-ping-once"
            )}
            onClick={() => setIsPlaying((isPlaying) => !isPlaying)}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {isPlaying ? (
              <PauseCircle className="pointer-events-none" size={46} />
            ) : (
              <PlayCircle className="pointer-events-none" size={46} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
