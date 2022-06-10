import { Popover } from "@headlessui/react"
import clsx from "clsx"
import React from "react"
import { Service } from "../../infra/mirakurun/api"
import { ServiceWithLogoData } from "../../types/mirakurun"

export const ScrollServices: React.FC<{
  services: ServiceWithLogoData[]
  setService: (service: Service) => void
}> = ({ services, setService }) => {
  return (
    <>
      {services.map((service, idx) => (
        <Popover className="relative">
          <Popover.Button
            className={`focus:outline-none cursor-pointer text-gray-100`}
          >
            <button
              type="button"
              className={clsx(
                "bg-gray-700",
                "w-48",
                "text-sm",
                "shrink-0",
                "text-center",
                "p-1",
                "py-2",
                "cursor-pointer",
                "border-r-2",
                "border-gray-400",
                "truncate",
                "select-none",
                "focus:outline-none",
                "hover:bg-gray-600",
                "flex",
                "items-center",
                "justify-center",
                "space-x-2"
              )}
              key={service.id}
            >
              {service.logoData && (
                <img
                  className={clsx(
                    "h-6",
                    "rounded-md",
                    "shrink-0",
                    "pointer-events-none"
                  )}
                  src={`data:image/jpeg;base64,${service.logoData}`}
                />
              )}
              <span className={clsx("truncate", "pointer-events-none")}>
                {`${service.name}`}
              </span>
            </button>
          </Popover.Button>
          <Popover.Panel
            className={clsx(
              "absolute",
              "z-10",
              "top-0",
              "mt-12",
              idx === services.length - 1 ? "right-0" : "left-0",
              "w-max",
              "grid",
              "grid-cols-1",
              "gap-2",
              "p-3",
              "bg-gray-700",
              "bg-opacity-80",
              "rounded-md"
            )}
          >
            <div className={clsx("p-2")}>
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
                <h3 className={clsx("shrink-0")}>{`${
                  service.remoteControlKeyId ?? service.serviceId
                } ${service.name}`}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setService(service)
              }}
              className={clsx(
                "p-1",
                "cursor-pointer",
                "bg-gray-800",
                "bg-opacity-70",
                "rounded-md"
              )}
            >
              視聴
            </button>
          </Popover.Panel>
        </Popover>
      ))}
    </>
  )
}
