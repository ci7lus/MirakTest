import clsx from "clsx"
import dayjs from "dayjs"
import React, { useEffect, useRef, useState } from "react"
import { useQuery } from "react-query"
import { useNow } from "../../hooks/date"
import { MirakurunAPI } from "../../infra/mirakurun"
import { Service } from "../../infra/mirakurun/api"
import { MirakurunSetting } from "../../types/setting"
import { HourIndicator } from "./HourIndicator"
import { ServiceRoll } from "./ServiceRoll"
import { ScrollServices } from "./Services"

const HOUR_HEIGHT = 180

export const ScrollArea: React.FC<{
  mirakurunSetting: MirakurunSetting
  services: Service[] | null
  add: number
  setService: (service: Service) => void
}> = ({ mirakurunSetting, services, add, setService }) => {
  const now = useNow()
  const displayStartAt = dayjs().startOf("hour").add(add, "day")
  const displayStartTimeInString = displayStartAt.format()
  const mirakurun = new MirakurunAPI(mirakurunSetting)
  const { isLoading, error, data } = useQuery(
    "mirakurun-programs",
    () => mirakurun.programs.getPrograms().then((res) => res.data),
    { refetchInterval: false }
  )
  const [filteredServices, setFilteredServices] = useState(services)
  const [programs, setPrograms] = useState(data)
  useEffect(() => {
    const endAt = displayStartAt.clone().add(1, "day")
    setPrograms(
      data?.filter(
        (program) =>
          program.name &&
          0 < program.name.length &&
          dayjs(program.startAt + program.duration).isAfter(displayStartAt) &&
          dayjs(program.startAt).isBefore(endAt)
      )
    )
  }, [data, add])
  useEffect(() => {
    setFilteredServices(
      services?.filter((service) =>
        programs?.find((program) => program.serviceId === service.serviceId)
      ) || null
    )
  }, [data, programs])
  const [isPushing, setIsPushing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const timerRef = useRef<NodeJS.Timer>()

  if (error) {
    return (
      <div
        className={clsx(
          "w-full",
          "h-full",
          "flex",
          "items-center",
          "justify-center",
          "text-lg"
        )}
      >
        読み込み中にエラーが発生しました:{" "}
        {error instanceof Error ? error.message : error}
      </div>
    )
  }
  if (isLoading) {
    return (
      <div
        className={clsx(
          "w-full",
          "h-full",
          "flex",
          "items-center",
          "justify-center",
          "text-lg"
        )}
      >
        番組情報を読み込み中です...
      </div>
    )
  }
  return (
    <div
      className={clsx(
        "w-full",
        "overflow-auto",
        "flex",
        "flex-col",
        "relative"
      )}
    >
      <div
        className={clsx(
          "w-full",
          "overflow-auto",
          "h-full",
          "scrollbar",
          "scrollbar-thumb-gray-600",
          "scrollbar-track-gray-200",
          isDragging && "cursor-move"
        )}
        onMouseDown={(e) => {
          setIsPushing(true)
          setX(e.clientX)
          setY(e.clientY)
        }}
        onMouseUp={() => {
          setIsPushing(false)
        }}
        onMouseMove={(e) => {
          // ref: https://github.com/l3tnun/EPGStation/blob/ed9cc6eadc6cfc2adab4ede128b1edeb09c30328/client/src/components/guide/GuideScroller.vue#L56
          if (!isPushing) {
            return
          }
          setIsDragging(true)
          const clientX = e.clientX
          const clientY = e.clientY
          e.currentTarget.scrollLeft += x - clientX
          e.currentTarget.scrollTop += y - clientY
          setX(clientX)
          setY(clientY)
          const timer = timerRef.current
          if (timer) {
            clearTimeout(timer)
          }
          timerRef.current = setTimeout(() => {
            setIsDragging(false)
            timerRef.current = undefined
          }, 100)
        }}
      >
        {filteredServices && (
          <div
            className={clsx(
              "flex",
              "pl-4",
              "sticky",
              "flex-shrink-0",
              "text-gray-100",
              "top-0",
              "z-20"
            )}
          >
            <ScrollServices
              services={filteredServices}
              setService={setService}
            />
          </div>
        )}
        <div className={clsx("flex", "w-max")}>
          <div
            className={
              "sticky left-0 h-full bg-gray-700 text-gray-200 font-bold pointer-events-none w-4 flex-shrink-0 z-10"
            }
          >
            <HourIndicator
              hourHeight={HOUR_HEIGHT}
              displayStartTimeInString={displayStartTimeInString}
            />
          </div>
          <div
            className={clsx(
              "relative",
              "flex",
              "text-gray-900",
              "flex-shrink-0",
              "w-max",
              "h-max"
            )}
          >
            {filteredServices?.map((service) => {
              const filteredPrograms =
                programs?.filter(
                  (program) => program.serviceId === service.serviceId
                ) || []
              return (
                <ServiceRoll
                  key={service.id}
                  service={service}
                  programs={filteredPrograms}
                  displayStartTimeInString={displayStartTimeInString}
                  hourHeight={HOUR_HEIGHT}
                />
              )
            })}
            <div
              className={`opacity-50 absolute w-full left-0 border-t-4 ${
                add === 0 ? "border-red-400" : "border-red-200"
              } transition-all pointer-events-none`}
              style={{
                top: `${(now.minute() / 60) * 180}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
