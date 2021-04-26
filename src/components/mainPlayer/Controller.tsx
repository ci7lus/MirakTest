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
  mainPlayerCurrentProgram,
  mainPlayerLastSelectedServiceId,
  mainPlayerSelectedService,
  mainPlayerSubtitleEnabled,
  mainPlayerTitle,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { useNow } from "../../hooks/date"
import { useDebounce } from "react-use"
import { CoiledScreenshotButton } from "./controllers/ScreenshotButton"
import { ipcRenderer } from "electron"
import type { Presence } from "discord-rpc"
import { ServiceSelector } from "./controllers/ServiceSelector"
import { VolumeSlider } from "./controllers/VolumeSlider"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { SubtitleToggleButton } from "./controllers/SubtitleToggleButton"
import { useRefFromState } from "../../hooks/ref"
import { experimentalSetting } from "../../atoms/settings"

export const CoiledController: React.VFC<{}> = () => {
  const [isVisible, setIsVisible] = useState(false)

  const [lastCurMoved, setLastCurMoved] = useState(0)
  useDebounce(
    () => {
      setIsVisible(false)
    },
    3000,
    [lastCurMoved]
  )

  const services = useRecoilValue(mirakurunServices)
  const [selectedService, setSelectedService] = useRecoilState(
    mainPlayerSelectedService
  )
  const now = useNow()
  const programs = useRecoilValue(mirakurunPrograms)
  const setCurrentProgram = useSetRecoilState(mainPlayerCurrentProgram)
  const setTitle = useSetRecoilState(mainPlayerTitle)

  const [subtitleEnabled, setSubtitleEnabled] = useRecoilState(
    mainPlayerSubtitleEnabled
  )
  const [volume, setVolume] = useRecoilState(mainPlayerVolume)
  const [commentOpacity, setCommentOpacity] = useRecoilState(
    mainPlayerCommentOpacity
  )

  const [audioTrack, setAudioTrack] = useRecoilState(mainPlayerAudioTrack)
  const audioTracks = useRecoilValue(mainPlayerAudioTracks)

  useEffect(() => {
    if (!selectedService) {
      setTitle(null)
      ipcRenderer.send("rich-presence", null)
      return
    }
    const currentProgram = programs?.find(
      (program) =>
        program.serviceId === selectedService.serviceId &&
        now.isAfter(program.startAt) &&
        now.isBefore(program.startAt + program.duration)
    )
    console.log("放送中の番組:", currentProgram)
    let title = `${selectedService.name}`
    if (currentProgram) {
      setCurrentProgram(currentProgram)
      if (currentProgram.name) {
        title = `${currentProgram.name} - ${selectedService.name}`
      }
      const activity: Presence = {
        largeImageKey: "miraktest_icon",
        details: selectedService.name,
        state: currentProgram.name,
        startTimestamp: currentProgram.startAt / 1000,
        endTimestamp: (currentProgram.startAt + currentProgram.duration) / 1000,
        instance: false,
      }
      ipcRenderer.send("rich-presence", activity)
    } else {
      setCurrentProgram(null)
      const activity: Presence = {
        largeImageKey: "miraktest_icon",
        details: selectedService.name,
        instance: false,
      }
      ipcRenderer.send("rich-presence", activity)
    }
    setTitle(title)
  }, [programs, selectedService, now])

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
    const yPos = y - mouseY - 22
    if (0 < xPos && 0 < yPos) {
      currentWindow.setPosition(xPos, yPos)
    }
    animId.current = requestAnimationFrame(moveWindow)
  }
  // 移動キャンセル
  const cancelMoveWindow = () =>
    requestAnimationFrame(() => cancelAnimationFrame(animId.current))

  // フルスクリーンモード脱出時の追従
  useEffect(() => {
    currentWindow.on("leave-full-screen", cancelMoveWindow)
    return () => {
      currentWindow.off("leave-full-screen", cancelMoveWindow)
    }
  }, [])

  const experimental = useRecoilValue(experimentalSetting)

  return (
    <div
      ref={componentRef}
      className="w-full h-full flex flex-col justify-between"
      onMouseMove={() => {
        setIsVisible(true)
        setLastCurMoved(performance.now())
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
        />
        <VolumeSlider volume={volume} setVolume={setVolume} />
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
