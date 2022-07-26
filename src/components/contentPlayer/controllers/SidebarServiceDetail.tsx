import clsx from "clsx"
import dayjs from "dayjs"
import React, { memo, useState } from "react"
// import Marquee from "react-fast-marquee"
import { ChevronsRight } from "react-feather"
import { Service, Program } from "../../../infra/mirakurun/api"
import { ServiceWithLogoData } from "../../../types/mirakurun"
import { EscapeEnclosed } from "../../common/EscapeEnclosed"

export const SidebarServiceDetail = memo(
  ({
    service,
    queriedPrograms,
    setService,
  }: {
    service: ServiceWithLogoData
    queriedPrograms: Program[]
    setService: (s: Service) => void
  }) => {
    const programs = queriedPrograms
      .filter(
        (program) =>
          program.serviceId === service.serviceId &&
          program.networkId === service.networkId
      )
      .sort((a, b) => a.startAt - b.startAt)
    const current = programs?.[0]
    const next = programs?.[1]
    const [, /*isHovering*/ setIsHovering] = useState(false)
    const [whenMouseDown, setWhenMouseDown] = useState(0)
    return (
      <button
        key={service.id}
        onMouseDown={() => setWhenMouseDown(performance.now())}
        onMouseUp={() => {
          if (performance.now() - whenMouseDown < 200) {
            setService(service)
          }
        }}
        onClick={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={clsx(
          "cursor-pointer",
          "w-full",
          "app-region-no-drag",
          "text-left",
          "align-top"
        )}
      >
        <div
          className={clsx(
            "p-4",
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
            title={service.name}
          >
            {service.logoData && (
              <img
                className={clsx("h-6", "rounded-md", "shrink-0")}
                src={`data:image/jpeg;base64,${service.logoData}`}
              />
            )}
            {/*// TODO: https://github.com/justin-chu/react-fast-marquee/issues/32
            <Marquee
              play={isHovering}
              gradient={false}
              className={clsx("shrink-0")}
              speed={40}
            >
              {service.name}
            </Marquee>*/}
            <h3 className="shrink-0">{service.name}</h3>
          </div>
          {current?.name && (
            <div className={clsx(service.logoData ? "mt-2" : "mt-1")}>
              <h4 className={clsx("text-lg", "leading-snug")}>
                <EscapeEnclosed str={current.name || ""} />
              </h4>
              <p>
                {`${dayjs(current.startAt).format("HH:mm")}〜${
                  current.duration !== 1
                    ? `${dayjs(current.startAt + current.duration).format(
                        "HH:mm"
                      )} (${Math.floor(current.duration / 1000 / 60)}分間)`
                    : ""
                }`}
              </p>
              <p className={clsx("my-1", "text-sm", "px-2")}>
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
            <div className="text-sm">
              次の番組
              <ChevronsRight size="1rem" className={clsx("inline", "mb-0.5")} />
              <span>
                {`${dayjs(next.startAt).format("HH:mm")}〜${
                  current.duration !== 1
                    ? dayjs(next.startAt + next.duration).format("HH:mm")
                    : ""
                } `}
                <EscapeEnclosed str={next.name || ""} />
                {next.duration !== 1
                  ? ` (${Math.floor(next.duration / 1000 / 60)}分間)`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </button>
    )
  },
  (prev, next) =>
    prev.service.id === next.service.id &&
    prev.queriedPrograms === next.queriedPrograms
)
