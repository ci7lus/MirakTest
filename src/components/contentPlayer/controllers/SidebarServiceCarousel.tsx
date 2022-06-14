import clsx from "clsx"
import React, { memo, useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import { useSpringCarousel } from "react-spring-carousel-js"
import { Service, Program } from "../../../infra/mirakurun/api"
import { SidebarServiceDetail } from "./SidebarServiceDetail"

const RightArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className={clsx(
        "absolute",
        "bg-gray-800",
        "bg-opacity-80",
        "cursor-pointer",
        "right-0",
        "py-2",
        "rounded-md",
        "z-10",
        "top-1/2",
        "-translate-y-1/2",
        "transform"
      )}
      onClick={onClick}
    >
      <ChevronRight className={clsx("pointer-events-none")} size={24} />
    </button>
  )
}

const LeftArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className={clsx(
        "absolute",
        "bg-gray-800",
        "bg-opacity-80",
        "cursor-pointer",
        "left-0",
        "py-2",
        "rounded-md",
        "z-10",
        "top-1/2",
        "-translate-y-1/2",
        "transform"
      )}
      onClick={onClick}
    >
      <ChevronLeft className={clsx("pointer-events-none")} size={24} />
    </button>
  )
}

export const SidebarServiceCarousel = memo(
  ({
    services,
    queriedPrograms,
    setService,
  }: {
    services: Service[]
    queriedPrograms: Program[]
    setService: (s: Service) => void
  }) => {
    const {
      carouselFragment,
      slideToNextItem,
      slideToPrevItem,
      getCurrentActiveItem,
    } = useSpringCarousel({
      items: services.map((service) => ({
        id: service.id.toString(),
        renderItem: (
          <SidebarServiceDetail
            service={service}
            queriedPrograms={queriedPrograms}
            setService={setService}
          />
        ),
      })),
    })
    const [currentItem, setCurrentItem] = useState(0)
    return (
      <div
        className={clsx("relative", "w-full")}
        onMouseUp={() => {
          setCurrentItem(getCurrentActiveItem()?.index ?? 0)
        }}
      >
        {currentItem !== 0 && (
          <LeftArrow
            onClick={() => {
              slideToPrevItem()
              setCurrentItem(getCurrentActiveItem()?.index ?? 0)
            }}
          />
        )}
        {carouselFragment}
        {currentItem !== services.length - 1 && (
          <RightArrow
            onClick={() => {
              slideToNextItem()
              setCurrentItem(getCurrentActiveItem()?.index ?? 0)
            }}
          />
        )}
      </div>
    )
  },
  (prev, next) =>
    prev.services.map((s) => s.id).join() ===
      next.services.map((s) => s.id).join() &&
    prev.queriedPrograms === next.queriedPrograms
)
