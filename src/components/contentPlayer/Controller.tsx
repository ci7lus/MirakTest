import clsx from "clsx"
import dayjs from "dayjs"
import { ipcRenderer, remote } from "electron"
import React, { useEffect, useRef, useState } from "react"
import { ChevronDown, PauseCircle, PlayCircle } from "react-feather"
import { useDebounce } from "react-use"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerAudioChannelAtom,
  contentPlayerAudioTrackAtom,
  contentPlayerAudioTracksAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPlayingPositionAtom,
  contentPlayerPlayingTimeAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerScreenshotTriggerAtom,
  contentPlayerSelectedServiceAtom,
  contentPlayerServiceLogoUrlAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerVolumeAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
  contentPlayerServiceSelector,
} from "../../atoms/contentPlayerSelectors"
import { mirakurunServicesAtom } from "../../atoms/mirakurun"
import { controllerSetting, experimentalSetting } from "../../atoms/settings"
import { UPDATE_IS_PLAYING_STATE } from "../../constants/ipc"
import { useRefFromState } from "../../hooks/ref"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { PlayToggleButton } from "./controllers/PlayToggleButton"
import { CoiledScreenshotButton } from "./controllers/ScreenshotButton"
import { SeekableControl } from "./controllers/SeekableControl"
import { ServiceSelector } from "./controllers/ServiceSelector"
import { SubtitleToggleButton } from "./controllers/SubtitleToggleButton"
import { VolumeSlider } from "./controllers/VolumeSlider"

import "dayjs/locale/ja"
dayjs.locale("ja")

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

  const [isPlaying, setIsPlaying] = useRecoilState(contentPlayerIsPlayingAtom)
  const position = useRecoilValue(contentPlayerPlayingPositionAtom)
  const setPosition = useSetRecoilState(contentPlayerPositionUpdateTriggerAtom)
  const isSeekable = useRecoilValue(contentPlayerIsSeekableAtom)

  const services = useRecoilValue(mirakurunServicesAtom)
  const [selectedService, setSelectedService] = useRecoilState(
    contentPlayerSelectedServiceAtom
  )
  const serviceLogoUrl = useRecoilValue(contentPlayerServiceLogoUrlAtom)

  const [subtitleEnabled, setSubtitleEnabled] = useRecoilState(
    contentPlayerSubtitleEnabledAtom
  )
  const [volume, setVolume] = useRecoilState(contentPlayerVolumeAtom)

  const [audioTrack, setAudioTrack] = useRecoilState(
    contentPlayerAudioTrackAtom
  )
  const audioTracks = useRecoilValue(contentPlayerAudioTracksAtom)
  const program = useRecoilValue(contentPlayerProgramSelector)
  const service = useRecoilValue(contentPlayerServiceSelector)
  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), 5 * 1000)
    return () => clearInterval(timer)
  }, [service])
  const [audioChannel, setAudioChannel] = useRecoilState(
    contentPlayerAudioChannelAtom
  )

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
  const setScreenshotTrigger = useSetRecoilState(
    contentPlayerScreenshotTriggerAtom
  )
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

  useEffect(() => {
    ipcRenderer
      .invoke(UPDATE_IS_PLAYING_STATE, {
        isPlaying,
        windowId: currentWindow.id,
      })
      .catch(console.error)
  }, [isPlaying])

  const startAt = dayjs(program?.startAt).format(
    isSeekable ? "YYYY/MM/DD(ddd) HH:mm" : "HH:mm"
  )
  const endAt = dayjs(program ? program.startAt + program.duration : 0).format(
    "HH:mm"
  )
  const [serviceLabel, setServiceLabel] = useState<string | null>(null)
  useEffect(() => {
    if (!service) {
      setServiceLabel(null)
      return
    }
    setServiceLabel(
      [service.remoteControlKeyId || service.serviceId, service.name]
        .filter((s) => s !== undefined)
        .join(" ")
    )
  }, [service])
  const time = useRecoilValue(contentPlayerPlayingTimeAtom)

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
          className={`select-none transition-opacity duration-150 ease-in-out pt-3 p-4 pb-6 bg-gradient-to-b bg-opacity-50 from-black to-transparent ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-4 pb-2">
            {serviceLogoUrl && (
              <img
                className="flex-shrink-0 h-6 rounded-md overflow-hidden"
                src={serviceLogoUrl}
              />
            )}
            <div className="relative text-gray-200 overflow-hidden">
              <div className="absolute top-0 opacity-0 w-full h-full">
                <ServiceSelector
                  services={services}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  isProgramDetailEnabled={
                    experimental.isProgramDetailInServiceSelectorEnabled
                  }
                />
              </div>
              {program ? (
                <div className="flex flex-col">
                  <h2 className="font-semibold text-2xl truncate">
                    {program.name}
                  </h2>
                  <div className="flex space-x-4 font-normal text-lg truncate">
                    {serviceLabel ? (
                      <div className="flex items-center space-x-1">
                        <p>{serviceLabel}</p>
                        <ChevronDown size="1.125rem" />
                      </div>
                    ) : (
                      <></>
                    )}
                    <p>
                      {startAt} 〜 {endAt}
                    </p>
                  </div>
                </div>
              ) : serviceLabel ? (
                <div className="font-semibold text-2xl flex items-center space-x-1">
                  <p>{serviceLabel}</p>
                  <ChevronDown size="1.5rem" />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col text-gray-100 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-gradient-to-t from-black to-transparent ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isSeekable ? (
            <SeekableControl
              time={time}
              position={position}
              setPosition={setPosition}
              duration={program?.duration}
            />
          ) : (
            <></>
          )}
          <div className="flex space-x-2">
            <PlayToggleButton
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
            <VolumeSlider
              volume={volume}
              setVolume={setVolume}
              min={controller.volumeRange[0]}
              max={controller.volumeRange[1]}
            />
            <div className="w-full"></div>
            <SubtitleToggleButton
              subtitleEnabled={subtitleEnabled}
              setSubtitleEnabled={setSubtitleEnabled}
            />
            <CoiledScreenshotButton />
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
            <div className="p-4 rounded-full bg-opacity-50 bg-gray-800">
              {isPlaying ? (
                <PauseCircle className="pointer-events-none" size="3rem" />
              ) : (
                <PlayCircle className="pointer-events-none" size="3rem" />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
