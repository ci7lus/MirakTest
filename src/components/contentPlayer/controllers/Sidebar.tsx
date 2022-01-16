import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import Carousel from "react-multi-carousel"
import { useRecoilValue } from "recoil"
import { lastEpgUpdatedAtom } from "../../../atoms/contentPlayer"
import { useNow } from "../../../hooks/date"
import { ChannelType, Program, Service } from "../../../infra/mirakurun/api"
import { convertVariationSelectedClosed } from "../../../utils/enclosed"
import { EscapeEnclosed } from "../../common/EscapeEnclosed"
import { SidebarServiceDetail } from "./SidebarServiceDetail"

import "react-multi-carousel/lib/styles.css"

const RightArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className={clsx(
        "absolute",
        "bg-gray-800",
        "bg-opacity-50",
        "cursor-pointer",
        "right-0",
        "p-2",
        "rounded-md"
      )}
      onClick={onClick}
    >
      <ChevronRight className={clsx("pointer-events-none")} size={24} />
    </button>
  )
}

const LeftArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className={clsx(
        "absolute",
        "bg-gray-800",
        "bg-opacity-50",
        "cursor-pointer",
        "left-0",
        "p-2",
        "rounded-md"
      )}
      onClick={onClick}
    >
      <ChevronLeft className={clsx("pointer-events-none")} size={24} />
    </button>
  )
}

export const ControllerSidebar: React.FC<{
  isVisible: boolean
  services: Service[]
  setService: (service: Service) => unknown
}> = ({ isVisible, services, setService }) => {
  const serviceTypes = Array.from(
    new Set(services.map((service) => service.channel?.type).filter((s) => s))
  )
  const [selectedType, setSelectedType] = useState<ChannelType | undefined>(
    serviceTypes?.[0]
  )
  const targetServices = useMemo(
    () =>
      Object.values(
        services
          .filter((service) => service.channel?.type === selectedType)
          .reduce((services: Record<string, Service[]>, service) => {
            const identifier =
              service.channel?.type === "CS"
                ? service.id
                : service.remoteControlKeyId ??
                  service.channel?.channel ??
                  service.id
            if (!identifier) {
              return services
            }
            if (!services[identifier]) {
              services[identifier] = [service]
            } else {
              services[identifier].push(service)
            }
            return services
          }, {})
      ).sort(
        (a, b) =>
          (a[0].remoteControlKeyId ?? a[0].serviceId) -
          (b[0].remoteControlKeyId ?? b[0].serviceId)
      ),
    [selectedType, services]
  )
  const now = useNow()
  const [queriedPrograms, setQueriedPrograms] = useState<Program[]>([])
  const lastEpgUpdated = useRecoilValue(lastEpgUpdatedAtom)
  useEffect(() => {
    const unix = now.unix() * 1000
    window.Preload.public.epgManager
      .query({
        startAtLessThan: unix,
        endAtMoreThan: unix + 1,
      })
      .then(async (currentPrograms) => {
        const filter = (program: Program) =>
          services.find(
            (service) =>
              service.serviceId === program.serviceId &&
              service.networkId === program.networkId
          )
        const filtered = currentPrograms.filter(filter)
        const max = Math.max(
          ...filtered.map((program) => program.startAt + program.duration)
        )
        if (!max) {
          setQueriedPrograms(filtered)
          return
        }
        const programs = await window.Preload.public.epgManager.query({
          startAtLessThan: max,
          startAt: unix,
        })
        setQueriedPrograms([...programs.filter(filter), ...filtered])
      })
  }, [now, lastEpgUpdated])
  return (
    <div
      className={clsx(
        "w-full",
        "h-full",
        "bg-gray-800 bg-opacity-30",
        "duration-150 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
        !isVisible && "cursor-none",
        "p-4",
        "flex",
        "flex-col"
      )}
      onWheel={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className={clsx("flex", "flex-col", "h-full")}>
        <div
          className={clsx(
            "overflow-auto",
            "flex",
            "pb-2",
            "flex-shrink-0",
            "scrollbar-thin"
          )}
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY
          }}
        >
          {serviceTypes.map((type, idx) => (
            <button
              key={type}
              type="button"
              className={clsx(
                "cursor-pointer",
                type === selectedType ? "bg-gray-600" : "bg-gray-800",
                "text-gray-100",
                idx === 0 && "rounded-l-md",
                idx === serviceTypes.length - 1 && "rounded-r-md",
                idx !== serviceTypes.length - 1 && "border-r border-gray-100",
                "px-3",
                "py-2",
                "focus:outline-none",
                "bg-opacity-70"
              )}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className={clsx("overflow-auto")}>
          <div
            className={clsx("grid", "grid-cols-2", "gap-2", "lg:grid-cols-3")}
          >
            {targetServices.map((services) => {
              const service = services[0]
              const programs = queriedPrograms
                .filter(
                  (program) =>
                    program.serviceId === service.serviceId &&
                    program.networkId === service.networkId
                )
                .sort((a, b) => a.startAt - b.startAt)
              const current = programs?.[0]
              return (
                <button
                  key={"button" + service.id}
                  type="button"
                  className={clsx(
                    "bg-gray-800",
                    "bg-opacity-70",
                    "rounded-md",
                    "flex",
                    "flex-col",
                    "truncate",
                    "p-1",
                    "cursor-pointer"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    setService(service)
                  }}
                  title={convertVariationSelectedClosed(
                    [service.name, current?.name].filter((s) => s).join("\n")
                  )}
                >
                  <span
                    className={clsx("flex", "space-x-2", "pointer-events-none")}
                  >
                    {service.logoData && (
                      <img
                        className={clsx("h-6", "rounded-md", "flex-shrink-0")}
                        src={`data:image/jpeg;base64,${service.logoData}`}
                      />
                    )}
                    <span className={clsx("flex-shrink-0")}>
                      {service.remoteControlKeyId} {service.name}
                    </span>
                  </span>
                  {current?.name && (
                    <span className={clsx("pointer-events-none")}>
                      <EscapeEnclosed str={current.name || ""} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {targetServices.map((services) => {
            if (services.length < 2) {
              const service = services[0]
              return (
                <SidebarServiceDetail
                  key={service.id}
                  service={service}
                  queriedPrograms={queriedPrograms}
                  setService={setService}
                />
              )
            }
            return (
              <Carousel
                key={services[0].id + "s"}
                responsive={{
                  desktop: {
                    breakpoint: { max: Infinity, min: -1 },
                    items: 1,
                    partialVisibilityGutter: 30,
                  },
                }}
                showDots={false}
                ssr={false}
                renderArrowsWhenDisabled={false}
                partialVisible={true}
                // @ts-expect-error type is not assignable
                customRightArrow={<RightArrow />}
                // @ts-expect-error type is not assignable
                customLeftArrow={<LeftArrow />}
              >
                {services.map((service) => (
                  <SidebarServiceDetail
                    key={service.id}
                    service={service}
                    queriedPrograms={queriedPrograms}
                    setService={setService}
                  />
                ))}
              </Carousel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
