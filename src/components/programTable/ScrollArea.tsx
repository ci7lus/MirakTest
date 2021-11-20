import clsx from "clsx"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { useNow } from "../../hooks/date"
import { MirakurunAPI } from "../../infra/mirakurun"
import { Service } from "../../infra/mirakurun/api"
import { MirakurunSetting } from "../../types/setting"
import { HourIndicator } from "./HourIndicator"
import { ServiceRoll } from "./ServiceRoll"
import { ScrollServices } from "./Services"

const HOUR_HEIGHT = 180
const FULL_HEIGHT = HOUR_HEIGHT * 24

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
  const [leftPosition, setLeftPosition] = useState(0)
  const [topPosition, setTopPosition] = useState(0)
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
    //setFilteredServices([services![0]])
  }, [data, programs])

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
      <div className={clsx("overflow-hidden", "ml-4", "flex-shrink-0")}>
        <div
          style={{
            transform: `translateX(-${leftPosition}px)`,
          }}
        ></div>
      </div>
      <div
        className={clsx(
          "w-full",
          "overflow-auto",
          "h-full",
          "scrollbar",
          "scrollbar-thumb-gray-600",
          "scrollbar-track-gray-200"
        )}
        onScroll={(e) => {
          setLeftPosition(e.currentTarget.scrollLeft)
          setTopPosition(e.currentTarget.scrollTop)
        }}
      >
        <div
          className={clsx("relative", "flex", "text-gray-900", "pl-4", "mt-11")}
          style={{
            width: `${(filteredServices || []).length * 10}rem`,
            height: `${FULL_HEIGHT}px`,
          }}
        >
          {filteredServices?.map((service) => {
            const filteredPrograms =
              programs?.filter(
                (program) => program.serviceId === service.serviceId
              ) || []
            return (
              <ServiceRoll
                service={service}
                programs={filteredPrograms}
                displayStartTimeInString={displayStartTimeInString}
                hourHeight={HOUR_HEIGHT}
              />
            )
          })}
          {filteredServices && (
            <div
              className={clsx(
                "flex",
                "pl-4",
                "absolute",
                "left-0",
                "flex-shrink-0",
                "text-gray-100"
              )}
              style={{
                transform: `translateY(${topPosition}px)`,
                top: "-2.75rem",
              }}
            >
              <ScrollServices
                services={filteredServices}
                setService={setService}
              />
            </div>
          )}
          <div
            className={
              "absolute left-0 h-full bg-gray-700 text-gray-200 font-bold pointer-events-none w-4 flex-shrink-0"
            }
            style={{
              transform: `translateX(${leftPosition}px)`,
            }}
          >
            <HourIndicator
              hourHeight={HOUR_HEIGHT}
              displayStartTimeInString={displayStartTimeInString}
            />
          </div>
          <div
            className={`opacity-50 absolute w-full left-0 border-t-4 ${
              add === 0 ? "border-red-400" : "border-red-200"
            } transition-all pointer-events-none ml-4`}
            style={{
              top: `${(now.minute() / 60) * 180}px`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
