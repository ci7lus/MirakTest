import dayjs from "dayjs"
import React from "react"

export const HourIndicator: React.FC<{
  hourHeight: number
  displayStartTimeInString: string
}> = ({ hourHeight, displayStartTimeInString }) => {
  const displayStartTime = dayjs(displayStartTimeInString)
  return (
    <>
      {[...Array(24).keys()].map((idx) => {
        return (
          <div
            key={idx}
            className="text-center w-full whitespace-pre border-b border-gray-200"
            style={{ height: `${hourHeight}px` }}
          >
            {displayStartTime.clone().add(idx, "hour").hour()}
          </div>
        )
      })}
    </>
  )
}
