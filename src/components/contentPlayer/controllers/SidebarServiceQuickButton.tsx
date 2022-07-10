import clsx from "clsx"
import dayjs from "dayjs"
import React, { memo } from "react"
import { Service, Program } from "../../../infra/mirakurun/api"
import { ServiceWithLogoData } from "../../../types/mirakurun"
import { convertVariationSelectedClosed } from "../../../utils/enclosed"
import { EscapeEnclosed } from "../../common/EscapeEnclosed"

export const SidebarServiceQuickButton = memo(
  ({
    service,
    setService,
    program,
  }: {
    service: ServiceWithLogoData
    setService: (s: Service) => void
    program: Program | undefined
  }) => {
    return (
      <button
        type="button"
        className={clsx(
          "bg-gray-800",
          "bg-opacity-70",
          "rounded-md",
          "flex",
          "flex-col",
          "truncate",
          "p-2",
          "overflow-hidden"
        )}
        onClick={(e) => {
          e.preventDefault()
          setService(service)
        }}
        title={convertVariationSelectedClosed(
          [
            [
              service.remoteControlKeyId ?? service.serviceId,
              service.name,
            ].join(" "),
            program
              ? `${program.name}\n${dayjs(program.startAt).format("HH:mm")}〜${
                  program.duration !== 1
                    ? dayjs(program.startAt)
                        .clone()
                        .add(program.duration, "milliseconds")
                        .format("HH:mm")
                    : ""
                }`.trim()
              : null,
            program?.description,
          ]
            .filter((s) => !!s)
            .join("\n\n")
        )}
      >
        <span
          className={clsx(
            "flex",
            "space-x-2",
            "items-center",
            "pointer-events-none",
            "overflow-hidden",
            "w-full"
          )}
        >
          {service.logoData && (
            <img
              className={clsx("h-6", "rounded-md", "shrink-0")}
              src={`data:image/jpeg;base64,${service.logoData}`}
            />
          )}
          <span className={clsx("w-full", "truncate", "text-left", "text-sm")}>
            {service.remoteControlKeyId ?? service.serviceId} {service.name}
          </span>
        </span>
        {program?.name && (
          <span
            className={clsx(
              "pointer-events-none",
              "truncate",
              "w-full",
              "mt-1",
              "text-left",
              "text-sm"
            )}
          >
            <EscapeEnclosed str={program.name || ""} />
          </span>
        )}
      </button>
    )
  },
  (prev, next) =>
    prev.service.id === next.service.id && prev.program?.id === next.program?.id
)
