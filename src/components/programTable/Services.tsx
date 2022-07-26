import { Popover, Switch } from "@headlessui/react"
import clsx from "clsx"
import React, { useState } from "react"
import { ROUTES } from "../../constants/routes"
import { Service } from "../../infra/mirakurun/api"
import { ServiceWithLogoData } from "../../types/mirakurun"

export const ScrollServices: React.FC<{
  services: ServiceWithLogoData[]
  setService: (service: Service) => void
}> = ({ services, setService }) => {
  const [isOpenInNewWindow, setIsOpenInNewWindow] = useState(false)
  return (
    <>
      {services.map((service, idx) => (
        <Popover key={service.id} className="relative">
          <Popover.Button
            className={clsx(
              "text-gray-100",
              "bg-gray-700",
              "w-48",
              "text-sm",
              "shrink-0",
              "text-center",
              "p-1",
              "py-2",
              "border-r-2",
              "border-gray-400",
              "truncate",
              "select-none",
              "hover:bg-gray-600",
              "flex",
              "items-center",
              "justify-center",
              "space-x-2"
            )}
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
            <div className="p-2">
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
                <h3 className="shrink-0">{`${
                  service.remoteControlKeyId ?? service.serviceId
                } ${service.name}`}</h3>
              </div>
            </div>
            <Switch.Group>
              <div className={clsx("flex", "items-center")}>
                <Switch
                  checked={isOpenInNewWindow}
                  onChange={(e: boolean | ((prevState: boolean) => boolean)) =>
                    setIsOpenInNewWindow(e)
                  }
                  className={`${
                    isOpenInNewWindow ? "bg-blue-600" : "bg-gray-300"
                  } relative inline-flex items-center h-6 rounded-full w-11 text-sm`}
                >
                  <span
                    className={`${
                      isOpenInNewWindow ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
                  />
                </Switch>
                <Switch.Label className={clsx("ml-2", "text-sm")}>
                  新しいウィンドウで開く
                </Switch.Label>
              </div>
            </Switch.Group>
            <button
              type="button"
              onClick={() => {
                if (isOpenInNewWindow) {
                  window.Preload.public.requestOpenWindow({
                    name: ROUTES.ContentPlayer,
                    isSingletone: false,
                    playingContent: {
                      contentType: "Mirakurun",
                      service,
                      url: "",
                    },
                  })
                } else {
                  setService(service)
                }
              }}
              className={clsx(
                "p-1",
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
