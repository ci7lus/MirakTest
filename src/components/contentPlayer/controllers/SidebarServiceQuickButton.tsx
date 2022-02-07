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
          "cursor-pointer",
          "overflow-hidden"
        )}
        onClick={(e) => {
          e.preventDefault()
          setService(service)
        }}
        title={convertVariationSelectedClosed(
          [
            service.name,
            program
              ? `${program.name}\n${dayjs(program.startAt).format("HH:mm")}〜${
                  program.duration !== 1
                    ? dayjs(program.startAt)
                        .clone()
                        .add(program.duration, "miliseconds")
                        .format("HH:mm")
                    : "（終了時間未定）"
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
            "pointer-events-none",
            "overflow-hidden",
            "w-full"
          )}
        >
          {service.logoData && (
            <img
              className={clsx("h-6", "rounded-md", "flex-shrink-0")}
              src={`data:image/jpeg;base64,${service.logoData}`}
            />
          )}
          <span className={clsx("w-full", "truncate", "text-left")}>
            {service.remoteControlKeyId} {service.name}
          </span>
        </span>
        {program?.name && (
          <span
            className={clsx(
              "pointer-events-none",
              "truncate",
              "w-full",
              "mt-1",
              "text-left"
            )}
          >
            <EscapeEnclosed str={program.name || ""} />
          </span>
        )}
      </button>
    )
  }
)
