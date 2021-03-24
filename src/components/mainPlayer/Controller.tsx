import React, { useEffect, useRef, useState } from "react"
import { MessageSquare, Volume1 } from "react-feather"
import { VolumeSlider } from "./VolumeSlider"
import { CommentOpacitySlider } from "./CommentOpacitySlider"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { mirakurunPrograms, mirakurunServices } from "../../atoms/mirakurun"
import {
  mainPlayerCurrentProgram,
  mainPlayerLastSelectedServiceId,
  mainPlayerSelectedService,
  mainPlayerTitle,
} from "../../atoms/mainPlayer"
import { useNow } from "../../hooks/date"

export const Controller: React.VFC<{}> = () => {
  const [isVisible, setIsVisible] = useState(false)

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

  useEffect(() => {
    if (!selectedService) return
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
      onMouseEnter={() => setIsVisible(true)}
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
        className={`text-gray-100 flex space-x-4 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-black bg-opacity-50 ${
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
                .sort((a, b) =>
                  (b.remoteControlKeyId || b.serviceId) <
                  (a.remoteControlKeyId || a.serviceId)
                    ? 1
                    : -1
                )
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
          <Volume1 size={20} />
          <VolumeSlider />
        </div>
        <div className="flex items-center justify-center space-x-1">
          <MessageSquare size={20} />
          <CommentOpacitySlider />
        </div>
      </div>
    </div>
  )
}
