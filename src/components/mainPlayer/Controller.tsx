import React, { useEffect, useRef, useState } from "react"
import { MessageSquare, Volume1 } from "react-feather"
import { VolumeSlider } from "./VolumeSlider"
import { CommentOpacitySlider } from "./CommentOpacitySlider"
import { useRecoilState, useRecoilValue } from "recoil"
import { mirakurunServices } from "../../atoms/mirakurun"
import {
  mainPlayerLastSelectedServiceId,
  mainPlayerSelectedService,
} from "../../atoms/mainPlayer"

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
        className={`select-none transition-opacity duration-150 ease-in-out p-4 text-4xl text-green-300 serviceNameOutline ${
          isServiceNameShowing ? "opacity-100" : "opacity-0"
        }`}
      >
        {selectedService?.name}
      </div>
      <div
        className={`text-gray-100 flex space-x-4 select-none transition-opacity duration-150 ease-in-out w-full p-2 bg-black bg-opacity-50 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <select
          className="appearance-none border border-gray-800 rounded py-2 px-2 leading-tight focus:outline-none bg-gray-800 focus:bg-gray-700 focus:border-gray-500 text-gray-100"
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
                .map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
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
