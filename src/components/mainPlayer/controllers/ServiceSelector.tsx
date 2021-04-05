import React from "react"
import { Service } from "../../../infra/mirakurun/api"

export const ServiceSelector: React.VFC<{
  services: Service[] | null
  selectedService: Service | null
  setSelectedService: React.Dispatch<React.SetStateAction<Service | null>>
}> = ({ services, selectedService, setSelectedService }) => {
  const serviceTypes = Array.from(
    new Set(
      services?.map((service) => service.channel?.type).filter((s) => s) || []
    )
  )

  return (
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
                {[service.remoteControlKeyId || service.serviceId, service.name]
                  .filter((s) => s !== undefined)
                  .join(" ")}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}
