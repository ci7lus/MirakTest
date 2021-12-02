import dayjs from "dayjs"
import React, { memo, useEffect, useMemo, useState } from "react"
import { useRecoilValue } from "recoil"
import { contentPlayerIsPlayingAtom } from "../../../atoms/contentPlayer"
import { useNow } from "../../../hooks/date"
import { Service } from "../../../infra/mirakurun/api"
import { queryPrograms } from "../../../utils/program"

const CoiledServiceOption: React.FC<{
  service: Service
  now: dayjs.Dayjs
  isProgramDetailEnabled: boolean
  isSelecting: boolean
}> = memo(({ service, now, isProgramDetailEnabled, isSelecting }) => {
  const [programLabel, setProgramLabel] = useState<string | null>(null)
  const isPlaying = useRecoilValue(contentPlayerIsPlayingAtom)
  useEffect(() => {
    if (!isProgramDetailEnabled || isSelecting) return
    const unix = now.unix() * 1000
    queryPrograms({
      serviceId: service.serviceId,
      networkId: service.networkId,
      startAtLessThan: unix,
      endAtMoreThan: unix,
    }).then((programs) => {
      const program = programs.slice(0).pop()
      if (program) {
        const startAt = dayjs(program.startAt).format("HH:mm")
        const endAt = dayjs(program.startAt + program.duration).format("HH:mm")

        setProgramLabel(
          [`/ ${startAt}〜${endAt}`, program.name]
            .filter((s) => s !== undefined)
            .join(": ")
            .trim()
        )
      } else {
        setProgramLabel(null)
      }
    })
  }, [service, now, isProgramDetailEnabled, isSelecting, isPlaying])
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
    const [isSelecting, setIsSelecting] = useState(false)
    const onSelectStart = () => setIsSelecting(true)
    const onSelectEnd = () => setIsSelecting(false)

    return (
      <select
        className="h-full w-full focus:appearance-none focus:outline-none text-gray-900 bg-transparent"
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
                  now={now}
                  isProgramDetailEnabled={isProgramDetailEnabled}
                  isSelecting={isSelecting}
                />
              ))}
          </optgroup>
        ))}
      </select>
    )
  }
)
