import clsx from "clsx"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { ChevronsRight } from "react-feather"
import { useRecoilValue } from "recoil"
import { lastEpgUpdatedAtom } from "../../../atoms/contentPlayer"
import { useNow } from "../../../hooks/date"
import { ChannelType, Program, Service } from "../../../infra/mirakurun/api"
import { EscapeEnclosed } from "../../common/EscapeEnclosed"

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
  const targetServices = services.filter(
    (service) => service.channel?.type === selectedType
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
          {targetServices.map((service) => {
            const programs = queriedPrograms
              .filter(
                (program) =>
                  program.serviceId === service.serviceId &&
                  program.networkId === service.networkId
              )
              .sort((a, b) => a.startAt - b.startAt)
            const current = programs?.[0]
            const next = programs?.[1]
            return (
              <a
                key={service.id}
                onClick={(e) => {
                  e.preventDefault()
                  setService(service)
                }}
                className={clsx("cursor-pointer")}
              >
                <div
                  className={clsx(
                    "p-3",
                    "rounded-md",
                    "bg-gray-800",
                    "bg-opacity-70",
                    "mt-2",
                    "pointer-events-none"
                  )}
                >
                  <div
                    className={clsx(
                      "flex",
                      "space-x-2",
                      "items-center",
                      "overflow-hidden",
                      "w-full",
                      "truncate"
                    )}
                  >
                    {service.logoData && (
                      <img
                        className={clsx("h-6", "rounded-md", "flex-shrink-0")}
                        src={`data:image/jpeg;base64,${service.logoData}`}
                      />
                    )}
                    <h3 className={clsx("flex-shrink-0")}>{service.name}</h3>
                  </div>
                  {current?.name && (
                    <div className={clsx(service.logoData ? "mt-2" : "mt-1")}>
                      <h4 className={clsx("text-lg", "leading-snug")}>
                        <EscapeEnclosed str={current.name || ""} />
                      </h4>
                      <p>
                        {dayjs(current.startAt).format("HH:mm")}〜
                        {dayjs(current.startAt + current.duration).format(
                          "HH:mm"
                        )}{" "}
                        ({Math.floor(current.duration / 1000 / 60)}分間)
                      </p>
                      <p className={clsx("my-1", "text-sm")}>
                        <EscapeEnclosed
                          str={
                            current.description?.trim() ||
                            Object.values(current.extended || {}).shift() ||
                            ""
                          }
                        />
                      </p>
                    </div>
                  )}
                  {next?.name && (
                    <div className={clsx("text-sm")}>
                      Next
                      <ChevronsRight size="1rem" className={clsx("inline")} />
                      <span>
                        {dayjs(next.startAt).format("HH:mm")}〜
                        {dayjs(next.startAt + next.duration).format("HH:mm")}{" "}
                        <EscapeEnclosed str={next.name || ""} /> (
                        {Math.floor(next.duration / 1000 / 60)}
                        分間)
                      </span>
                    </div>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
