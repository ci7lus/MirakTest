import dayjs from "dayjs"
import React, { memo, useEffect, useMemo, useState } from "react"
import { useRecoilValue } from "recoil"
import { mirakurunProgramsFamily } from "../../../atoms/mirakurun"
import { useNow } from "../../../hooks/date"
import { Service } from "../../../infra/mirakurun/api"
import { getCurrentProgramOfService } from "../../../utils/program"

const CoiledServiceOption: React.FC<{
  service: Service
  now: dayjs.Dayjs
  isProgramDetailEnabled: boolean
}> = memo(({ service, now, isProgramDetailEnabled }) => {
  const [programLabel, setProgramLabel] = useState<string | null>(null)
  const programs = useRecoilValue(mirakurunProgramsFamily(service.serviceId))
  useEffect(() => {
    if (!isProgramDetailEnabled) return
    const currentProgram = getCurrentProgramOfService({
      programs,
      serviceId: service.serviceId,
      now,
    })
    if (currentProgram) {
      const startAt = dayjs(currentProgram.startAt).format("HH:mm")
      const endAt = dayjs(
        currentProgram.startAt + currentProgram.duration
      ).format("HH:mm")

      setProgramLabel(
        [`/ ${startAt}〜${endAt}`, currentProgram.name]
          .filter((s) => s !== undefined)
          .join(": ")
          .trim()
      )
    } else {
      setProgramLabel(null)
    }
  }, [service, programs, now, isProgramDetailEnabled])
  return (
    <option value={service.id}>
      {[
        service.remoteControlKeyId || service.serviceId,
        service.name,
        programLabel,
      ]
        .filter((s) => s !== undefined)
        .join(" ")}
    </option>
  )
})

export const ServiceSelector: React.VFC<{
  services: Service[] | null
  selectedService: Service | null
  setSelectedService: React.Dispatch<React.SetStateAction<Service | null>>
  isProgramDetailEnabled: boolean
}> = memo(
  ({
    services,
    selectedService,
    setSelectedService,
    isProgramDetailEnabled,
  }) => {
    const serviceTypes = useMemo(
      () =>
        Array.from(
          new Set(
            services
              ?.map((service) => service.channel?.type)
              .filter((s) => s) || []
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
              .map((service) => (
                <CoiledServiceOption
                  key={service.id}
                  service={service}
                  now={fixedNow}
                  isProgramDetailEnabled={isProgramDetailEnabled}
                />
              ))}
          </optgroup>
        ))}
      </select>
    )
  }
)
