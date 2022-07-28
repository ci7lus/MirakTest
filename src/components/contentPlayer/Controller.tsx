import { Popover } from "@headlessui/react"
import { css, StyleSheet } from "aphrodite"
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
  contentPlayerBufferingAtom,
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
import { PluginPositionComponents } from "../common/PluginPositionComponents"
import { CoiledLoadingCircle } from "./LoadingCircle"
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

export const CoiledController: React.FC<{}> = () => {
  const [isVisible, setIsVisible] = useState(false)

  const [lastCurMoved, setLastCurMoved] = useState(0)
  useDebounce(
    () => {
      setIsVisible(false)
    },
    2500,
    [lastCurMoved]
  )
  useEffect(() => {
    window.Preload.setWindowButtonVisibility(isVisible)
  }, [isVisible])

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
  const [seekRequest, setSeekRequest] = useState<number | null>(null)
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
      } else if (e.key === "ArrowRight") {
        setSeekRequest(30_000)
      } else if (e.key === "ArrowLeft") {
        setSeekRequest(-10_000)
      } else if (e.key === "m") {
        setVolume((volume) => (0 < volume ? 0 : 100))
      } else if (e.code === "Space" && e.target === document.body) {
        // 要素にフォーカスがあるときは発火しないようにする（buttonでのSpace発火との競合を防ぐ）
        setIsPlaying((isPlaying) => !isPlaying)
      } else if (e.key === "Escape") {
        window.Preload.public.exitFullScreen()
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
  const buffering = useRecoilValue(contentPlayerBufferingAtom)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const style = StyleSheet.create({
    paddingTop: {
      paddingTop: "calc(env(titlebar-area-height) - 1.2rem)",
    },
  })

  return (
    <div
      ref={componentRef}
      className={clsx("w-full", "h-full", "relative", "flex")}
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
          !experimental.isWindowDragMoveEnabled ||
          // macOSではネイティブのフレームレスを使うようになったので有効にならないように
          process.platform === "darwin"
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
        if (controller.isVolumeWheelDisabled === true || e.deltaX !== 0) {
          return
        }
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
          "relative",
          "app-region-drag"
        )}
      >
        <div
          className={`select-none transition-opacity duration-150 ease-in-out pt-3 p-4 pb-6 bg-gradient-to-b bg-opacity-60 from-blackOpacity to-transparent ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`flex items-center space-x-4 ${css(style.paddingTop)}`}
          >
            {service?.logoData && (
              <img
                className={clsx(
                  "shrink-0",
                  "h-6",
                  "rounded-md",
                  "overflow-hidden"
                )}
                src={`data:image/png;base64,${service.logoData}`}
              />
            )}
            <div
              className={clsx("relative", "text-gray-200", "overflow-hidden")}
            >
              {program ? (
                <div className={clsx("flex", "flex-col")}>
                  <h1
                    className={clsx(
                      "font-semibold",
                      "text-2xl",
                      "truncate",
                      "align-middle"
                    )}
                    tabIndex={0}
                  >
                    <EscapeEnclosed str={program.name || ""} />
                  </h1>
                  <div
                    className={clsx(
                      "flex",
                      "space-x-3",
                      "font-normal",
                      "text-lg",
                      "truncate"
                    )}
                  >
                    {serviceLabel ? (
                      <h2 tabIndex={0}>{serviceLabel}</h2>
                    ) : (
                      <></>
                    )}
                    <p>
                      {`${startAt}〜${program.duration !== 1 ? endAt : ""}`}
                    </p>
                  </div>
                </div>
              ) : serviceLabel ? (
                <p
                  className={clsx(
                    "font-semibold",
                    "text-2xl",
                    "flex",
                    "items-center",
                    "space-x-1"
                  )}
                >
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
              seekRequest={seekRequest}
              setSeekRequest={setSeekRequest}
            />
          ) : (
            <></>
          )}
          <div className={clsx("flex", "space-x-2", "app-region-no-drag")}>
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
              <Popover.Button className={clsx("p-2", "text-gray-100")}>
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
                  "rounded-md",
                  "max-h-[80vh]",
                  "overflow-auto"
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
                <label
                  id="OnControllerPopupComponents"
                  className={clsx("max-w-lg", "pb-1")}
                >
                  <PluginPositionComponents
                    position="OnControllerPopup"
                    isAbsolute={false}
                  />
                </label>
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
              "pointer-events-auto",
              "rounded-l-md"
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
          isSidebarOpen ? "w-1/3" : "w-0 invisible"
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
      <div
        className={clsx(
          "absolute",
          "w-full",
          "h-full",
          "flex",
          "items-center",
          "justify-center",
          "pointer-events-none"
        )}
      >
        <button
          type="button"
          className={clsx(
            "transition-opacity",
            "duration-150",
            "ease-in-out",
            isPlayButtonShowing || !isPlaying
              ? "opacity-80 pointer-events-auto"
              : "opacity-0",
            isPlaying && "animate-ping-once"
          )}
          onClick={() => setIsPlaying((isPlaying) => !isPlaying)}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <div
            className={clsx(
              "p-4",
              "rounded-full",
              "bg-opacity-50",
              "bg-gray-800"
            )}
          >
            {isPlaying ? (
              <PauseCircle className="pointer-events-none" size="3rem" />
            ) : (
              <PlayCircle className="pointer-events-none" size="3rem" />
            )}
          </div>
        </button>
      </div>
      <div
        className={clsx(
          "absolute",
          "w-full",
          "h-full",
          "flex",
          "items-center",
          "justify-center",
          "pointer-events-none",
          "transition-opacity",
          "ease-in-out",
          "duration-150",
          buffering < 100 ? "opacity-80" : "opacity-0"
        )}
      >
        <CoiledLoadingCircle percentage={buffering} />
      </div>
    </div>
  )
}
