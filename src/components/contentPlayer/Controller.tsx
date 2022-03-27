import { Popover } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, PauseCircle, PlayCircle, Settings } from "react-feather"
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
  contentPlayerSpeedAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerVolumeAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
  contentPlayerServiceSelector,
} from "../../atoms/contentPlayerSelectors"
import { globalContentPlayerSelectedServiceFamily } from "../../atoms/globalFamilies"
import { mirakurunServicesAtom } from "../../atoms/mirakurun"
import { controllerSetting, experimentalSetting } from "../../atoms/settings"
import { useRefFromState } from "../../hooks/ref"
import { EscapeEnclosed } from "../common/EscapeEnclosed"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { FullScreenToggleButton } from "./controllers/FullScreenToggleButton"
import { PlayToggleButton } from "./controllers/PlayToggleButton"
import { CoiledScreenshotButton } from "./controllers/ScreenshotButton"
import { SeekableControl } from "./controllers/SeekableControl"
import { ControllerSidebar } from "./controllers/Sidebar"
import { SpeedSelector } from "./controllers/SpeedSelector"
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
  const setSelectedService = useSetRecoilState(
    globalContentPlayerSelectedServiceFamily(window.id ?? -1)
  )

  const [subtitleEnabled, setSubtitleEnabled] = useRecoilState(
    contentPlayerSubtitleEnabledAtom
  )
  const [volume, setVolume] = useRecoilState(contentPlayerVolumeAtom)

  const [speed, setSpeed] = useRecoilState(contentPlayerSpeedAtom)

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

  const moveWindow = useCallback(async () => {
    const [mouseX, mouseY] = mouseRef.current
    const { x, y } = await window.Preload.public.requestCursorScreenPoint()
    const xPos = x - mouseX
    const yPos = y - mouseY - window.outerHeight + window.innerHeight
    if (0 < xPos && 0 < yPos) {
      window.Preload.public.setWindowPosition(xPos, yPos)
    }
    animId.current = requestAnimationFrame(moveWindow)
  }, [mouseRef.current])
  // 移動キャンセル
  const cancelMoveWindow = useCallback(() => {
    cancelAnimationFrame(animId.current)
  }, [animId.current])

  const experimental = useRecoilValue(experimentalSetting)

  const controller = useRecoilValue(controllerSetting)

  // キーボードショートカット
  const setScreenshotTrigger = useSetRecoilState(
    contentPlayerScreenshotTriggerAtom
  )
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s") {
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
  useEffect(() => {
    const off = window.Preload.onScreenshotRequest(() =>
      setScreenshotTrigger(performance.now())
    )
    return () => {
      off()
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
    window.Preload.updateIsPlayingState(isPlaying).catch(console.error)
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div
      ref={componentRef}
      className="w-full h-full relative flex"
      onMouseMove={() => {
        setIsVisible(true)
        setLastCurMoved(new Date().getSeconds())
      }}
      onMouseLeave={() => {
        setIsVisible(false)
        cancelMoveWindow()
      }}
      onDoubleClick={() => window.Preload.public.toggleFullScreen()}
      onMouseDown={(e) => {
        if (
          e.button === 2 ||
          !document.hasFocus() ||
          !experimental.isWindowDragMoveEnabled
        ) {
          cancelMoveWindow()
          return
        }
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
          "h-full flex flex-col justify-between",
          "transition-width",
          !isVisible && "cursor-none",
          isSidebarOpen ? "w-2/3" : "w-full",
          "relative"
        )}
      >
        <div
          className={`select-none transition-opacity duration-150 ease-in-out pt-3 p-4 pb-4 bg-gradient-to-b bg-opacity-60 from-blackOpacity to-transparent ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-4 pb-2">
            {service?.logoData && (
              <img
                className="flex-shrink-0 h-6 rounded-md overflow-hidden"
                src={`data:image/png;base64,${service.logoData}`}
              />
            )}
            <div className="relative text-gray-200 overflow-hidden">
              {program ? (
                <div className="flex flex-col">
                  <h2 className="font-semibold text-2xl truncate align-middle">
                    <EscapeEnclosed str={program.name || ""} />
                  </h2>
                  <div className="flex space-x-3 font-normal text-lg truncate">
                    {serviceLabel ? <p>{serviceLabel}</p> : <></>}
                    <p>
                      {`${startAt}〜${program.duration !== 1 ? endAt : ""}`}
                    </p>
                  </div>
                </div>
              ) : serviceLabel ? (
                <p className="font-semibold text-2xl flex items-center space-x-1">
                  {serviceLabel}
                </p>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col text-gray-100 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-gradient-to-t bg-opacity-60 from-blackOpacity to-transparent ${
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
            <Popover className="relative">
              <Popover.Button
                className={`focus:outline-none cursor-pointer p-2 text-gray-100`}
              >
                <Settings className="pointer-events-none" size="1.75rem" />
              </Popover.Button>
              <Popover.Panel
                className={clsx(
                  "absolute",
                  "z-10",
                  "bottom-0",
                  "mb-12",
                  "right-0",
                  "-mr-4",
                  "w-max",
                  "grid",
                  "grid-cols-1",
                  "gap-2",
                  "p-3",
                  "bg-gray-700",
                  "bg-opacity-80",
                  "rounded-md"
                )}
              >
                <label>
                  <span
                    className={clsx(
                      "block",
                      "mb-1",
                      "text-sm",
                      "text-gray-300"
                    )}
                  >
                    オーディオチャンネル
                  </span>
                  <AudioChannelSelector
                    audioChannel={audioChannel}
                    setAudioChannel={setAudioChannel}
                  />
                </label>
                {3 <= audioTracks.length && (
                  <label>
                    <span
                      className={clsx(
                        "block",
                        "mb-1",
                        "text-sm",
                        "text-gray-300"
                      )}
                    >
                      オーディオトラック
                    </span>
                    <AudioTrackSelector
                      audioTrack={audioTrack}
                      setAudioTrack={setAudioTrack}
                      audioTracks={audioTracks}
                    />
                  </label>
                )}
                {isSeekable && (
                  <label>
                    <span
                      className={clsx(
                        "block",
                        "mb-1",
                        "text-sm",
                        "text-gray-300"
                      )}
                    >
                      再生速度
                    </span>
                    <SpeedSelector
                      isSeekable={isSeekable}
                      speed={speed}
                      setSpeed={setSpeed}
                    />
                  </label>
                )}
              </Popover.Panel>
            </Popover>
            <FullScreenToggleButton
              toggle={() => window.Preload.public.toggleFullScreen()}
            />
          </div>
        </div>
        <div
          className={clsx(
            "absolute",
            "left-0",
            "top-0",
            "w-full",
            "h-full",
            "transition-opacity",
            isVisible || isSidebarOpen ? "opacity-100" : "opacity-0",
            "flex",
            "items-center",
            "justify-end",
            "pointer-events-none"
          )}
        >
          <button
            type="button"
            className={clsx(
              "bg-gray-800",
              "bg-opacity-30",
              "border-1",
              "border-gray-800",
              "py-3",
              "focus:outline-none",
              "cursor-pointer",
              "pointer-events-auto"
            )}
            onClick={() => setIsSidebarOpen((o) => !o)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ChevronLeft
              width="3rem"
              className={clsx(
                "pointer-events-none",
                "transform",
                "duration-300",
                "transition-transform",
                isSidebarOpen && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>
      <div
        className={clsx(
          "h-full",
          "transition-width",
          isSidebarOpen ? "w-1/3" : "w-0"
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {services && (
          <ControllerSidebar
            isVisible={isVisible || isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            services={services}
            setService={setSelectedService}
          />
        )}
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
          <div className="p-4 rounded-full bg-opacity-50 bg-gray-800 cursor-pointer">
            {isPlaying ? (
              <PauseCircle className="pointer-events-none" size="3rem" />
            ) : (
              <PlayCircle className="pointer-events-none" size="3rem" />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
