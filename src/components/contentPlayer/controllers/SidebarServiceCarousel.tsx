import clsx from "clsx"
import React, { memo } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import Carousel from "react-multi-carousel"
import { Service, Program } from "../../../infra/mirakurun/api"
import { SidebarServiceDetail } from "./SidebarServiceDetail"

import "react-multi-carousel/lib/styles.css"

const RightArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className={clsx(
        "absolute",
        "bg-gray-800",
        "bg-opacity-50",
        "cursor-pointer",
        "right-0",
        "p-2",
        "rounded-md"
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
        "bg-opacity-50",
        "cursor-pointer",
        "left-0",
        "p-2",
        "rounded-md"
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
    return (
      <Carousel
        responsive={{
          desktop: {
            breakpoint: { max: Infinity, min: -1 },
            items: 1,
            partialVisibilityGutter: 30,
          },
        }}
        showDots={false}
        ssr={false}
        renderArrowsWhenDisabled={false}
        partialVisible={true}
        // @ts-expect-error type is not assignable
        customRightArrow={<RightArrow />}
        // @ts-expect-error type is not assignable
        customLeftArrow={<LeftArrow />}
      >
        {services.map((service) => (
          <SidebarServiceDetail
            key={service.id}
            service={service}
            queriedPrograms={queriedPrograms}
            setService={setService}
          />
        ))}
      </Carousel>
    )
  }
)
