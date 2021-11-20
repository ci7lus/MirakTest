import clsx from "clsx"
import React from "react"
import { Service } from "../../infra/mirakurun/api"

export const ScrollServices: React.VFC<{
  services: Service[]
  setService: (service: Service) => void
}> = ({ services, setService }) => {
  return (
    <>
      {services.map((service) => (
        <button
          type="button"
          className={clsx(
            "bg-gray-700",
            "w-40",
            "flex-shrink-0",
            "text-center",
            "p-1",
            "py-2",
            "cursor-pointer",
            "border-r-2",
            "border-gray-400",
            "truncate",
            "select-none",
            "focus:outline-none",
            "hover:bg-gray-600"
          )}
          key={service.id}
          onClick={() => {
            setService(service)
          }}
        >
          {service.name}
        </button>
      ))}
    </>
  )
}
