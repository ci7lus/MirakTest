import dayjs from "dayjs"
import React, { memo, useEffect, useMemo, useState } from "react"
import { useNow } from "../../../hooks/date"
import { Program, Service } from "../../../infra/mirakurun/api"
import { getCurrentProgramOfService } from "../../../utils/program"

export const ServiceSelector: React.VFC<{
  services: Service[] | null
  selectedService: Service | null
  setSelectedService: React.Dispatch<React.SetStateAction<Service | null>>
  programs: Program[] | null
}> = memo(({ services, selectedService, setSelectedService, programs }) => {
  const serviceTypes = useMemo(
    () =>
      Array.from(
        new Set(
          services?.map((service) => service.channel?.type).filter((s) => s) ||
            []
        )
      ),
    [services]
  )
  const now = useNow()
  const [fixedNow, setFixedNow] = useState(now)
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    if (isSelecting) return
    setFixedNow(now)
  }, [now])

  const onSelectStart = () => setIsSelecting(true)
  const onSelectEnd = () => setIsSelecting(false)

  return (
    <select
      className="appearance-none border border-gray-800 rounded py-2 px-2 leading-tight focus:outline-none bg-gray-800 bg-opacity-50 focus:bg-gray-700 focus:border-gray-500 text-gray-100 w-48"
      value={selectedService?.id}
      onChange={(e) => {
        onSelectStart()
        const selectedId = e.target.value
        const service = services?.find(
          (service) => service.id.toString() === selectedId
        )
        if (!service) return
        setSelectedService(service)
      }}
      onClick={onSelectStart}
      onBlur={onSelectEnd}
      onMouseOut={onSelectEnd}
    >
      {serviceTypes.map((serviceType) => (
        <optgroup key={serviceType} label={serviceType}>
          {services
            ?.filter((service) => service.channel?.type === serviceType)
            .map((service) => {
              let programLabel: string | undefined
              if (programs) {
                const currentProgram = getCurrentProgramOfService({
                  programs: programs,
                  serviceId: service.serviceId,
                  now: fixedNow,
                })
                if (currentProgram) {
                  const startAt = dayjs(currentProgram.startAt).format("HH:mm")
                  const endAt = dayjs(
                    currentProgram.startAt + currentProgram.duration
                  ).format("HH:mm")

                  programLabel = [`/ ${startAt}〜${endAt}`, currentProgram.name]
                    .filter((s) => s !== undefined)
                    .join(": ")
                    .trim()
                }
              }
              return (
                <option key={service.id} value={service.id}>
                  {[
                    service.remoteControlKeyId || service.serviceId,
                    service.name,
                    programLabel,
                  ]
                    .filter((s) => s !== undefined)
                    .join(" ")}
                </option>
              )
            })}
        </optgroup>
      ))}
    </select>
  )
})
