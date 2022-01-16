import clsx from "clsx"
import React, { memo } from "react"
import { Service, Program } from "../../../infra/mirakurun/api"
import { convertVariationSelectedClosed } from "../../../utils/enclosed"
import { EscapeEnclosed } from "../../common/EscapeEnclosed"

export const SidebarServiceQuickButton = memo(
  ({
    service,
    setService,
    program,
  }: {
    service: Service
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
          "p-1",
          "cursor-pointer"
        )}
        onClick={(e) => {
          e.preventDefault()
          setService(service)
        }}
        title={convertVariationSelectedClosed(
          [service.name, program?.name].filter((s) => s).join("\n")
        )}
      >
        <span className={clsx("flex", "space-x-2", "pointer-events-none")}>
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
        {program?.name && (
          <span className={clsx("pointer-events-none")}>
            <EscapeEnclosed str={program.name || ""} />
          </span>
        )}
      </button>
    )
  }
)
