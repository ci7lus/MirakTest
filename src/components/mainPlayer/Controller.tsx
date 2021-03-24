import React, { useEffect, useRef, useState } from "react"
import { MessageSquare, Type, Volume1, Volume2, VolumeX } from "react-feather"
import { VolumeSlider } from "./VolumeSlider"
import { CommentOpacitySlider } from "./CommentOpacitySlider"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { mirakurunPrograms, mirakurunServices } from "../../atoms/mirakurun"
import {
  mainPlayerCurrentProgram,
  mainPlayerLastSelectedServiceId,
  mainPlayerSelectedService,
  mainPlayerSubtitleEnabled,
  mainPlayerTitle,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { useNow } from "../../hooks/date"
import { useDebounce } from "react-use"

export const Controller: React.VFC<{}> = () => {
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
  const serviceTypes = Array.from(
    new Set(
      services?.map((service) => service.channel?.type).filter((s) => s) || []
    )
  )
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

  useEffect(() => {
    if (!selectedService) {
      setTitle(null)
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
        className={`px-2 overflow-auto text-gray-100 flex space-x-4 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-black bg-opacity-50 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <select
          className="appearance-none border border-gray-800 rounded py-2 px-2 leading-tight focus:outline-none bg-gray-800 bg-opacity-50 focus:bg-gray-700 focus:border-gray-500 text-gray-100"
          value={selectedService?.id}
          onChange={(e) => {
            const selectedId = e.target.value
            const service = services?.find(
              (service) => service.id.toString() === selectedId
            )
            if (!service) return
            setSelectedService(service)
          }}
        >
          {serviceTypes.map((serviceType) => (
            <optgroup key={serviceType} label={serviceType}>
              {services
                ?.filter((service) => service.channel?.type === serviceType)
                .sort((a, b) => (b.serviceId < a.serviceId ? 1 : -1))
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {[
                      service.remoteControlKeyId || service.serviceId,
                      service.name,
                    ]
                      .filter((s) => s !== undefined)
                      .join(" ")}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <div className="flex items-center justify-center space-x-1">
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => setVolume((volume) => (0 < volume ? 0 : 100))}
          >
            {volume === 0 ? (
              <VolumeX size={22} />
            ) : volume < 75 ? (
              <Volume1 size={22} />
            ) : (
              <Volume2 size={22} />
            )}
          </button>
          <VolumeSlider />
        </div>
        <button
          aria-label={`字幕は${subtitleEnabled}です`}
          title="字幕切り替え"
          type="button"
          className={`focus:outline-none p-2 rounded-md bg-gray-800 ${
            subtitleEnabled ? "text-gray-100" : "text-gray-500"
          }`}
          onClick={() => setSubtitleEnabled((value) => !value)}
        >
          <Type size={22} />
        </button>
        <div className="flex items-center justify-center space-x-1">
          <MessageSquare size={22} />
          <CommentOpacitySlider />
        </div>
      </div>
    </div>
  )
}
