import React, { useEffect, useRef, useState } from "react"
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
import { CoiledScreenShotButton } from "./controllers/ScreenShotButton"
import { ipcRenderer } from "electron"
import type { Presence } from "discord-rpc"
import { ServiceSelector } from "./controllers/ServiceSelector"
import { VolumeSlider } from "./controllers/VolumeSlider"
import { AudioChannelSelector } from "./controllers/AudioChannelSelector"
import { AudioTrackSelector } from "./controllers/AudioTrackSelector"
import { SubtitleToggleButton } from "./controllers/SubtitleToggleButton"

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
      ipcRenderer.send("rich-presence", null)
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

  return (
    <div
      ref={componentRef}
      className="w-full h-full flex flex-col justify-between"
      onMouseMove={() => {
        setIsVisible(true)
        setLastCurMoved(new Date().getTime())
      }}
      onMouseLeave={() => setIsVisible(false)}
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
        <CoiledScreenShotButton />
        <CommentOpacitySlider
          commentOpacity={commentOpacity}
          setCommentOpacity={setCommentOpacity}
        />
        <div className="pr-2" />
      </div>
    </div>
  )
}
