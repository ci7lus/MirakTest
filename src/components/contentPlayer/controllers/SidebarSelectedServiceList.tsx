import clsx from "clsx"
import React, { memo, useRef } from "react"
import { Service, Program } from "../../../infra/mirakurun/api"
import { SidebarServiceCarousel } from "./SidebarServiceCarousel"
import { SidebarServiceDetail } from "./SidebarServiceDetail"
import { SidebarServiceQuickButton } from "./SidebarServiceQuickButton"

export const SidebarSelectedServiceList: React.FC<{
  services: Service[][]
  queriedPrograms: Program[]
  setService: (s: Service) => void
}> = memo(
  ({ services, queriedPrograms, setService }) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    return (
      <div className={clsx("overflow-auto", "pr-2")} ref={scrollAreaRef}>
        <div className={clsx("grid", "grid-cols-2", "gap-2", "lg:grid-cols-3")}>
          {services.map((services) => {
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
              <SidebarServiceQuickButton
                key={"button" + service.id}
                service={service}
                setService={setService}
                program={current}
              />
            )
          })}
        </div>
        {services.map((services) => {
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
            <SidebarServiceCarousel
              key={services[0].id + "s"}
              services={services}
              queriedPrograms={queriedPrograms}
              setService={setService}
            />
          )
        })}
      </div>
    )
  },
  (prev, next) =>
    JSON.stringify(prev.services) === JSON.stringify(next.services) &&
    prev.queriedPrograms === next.queriedPrograms
)
