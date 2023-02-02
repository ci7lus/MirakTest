import { css, StyleSheet } from "aphrodite"
import dayjs from "dayjs"
import React from "react"
import { HOUR_HEIGHT } from "../../constants/style"

const style = StyleSheet.create({
  hourHeight: {
    height: `${HOUR_HEIGHT}rem`,
  },
})

export const HourIndicator: React.FC<{
  displayStartTimeInString: string
}> = ({ displayStartTimeInString }) => {
  const displayStartTime = dayjs(displayStartTimeInString)
  return (
    <>
      {[...Array(24).keys()].map((idx) => {
        return (
          <div
            key={idx}
            className={`text-center w-full whitespace-pre border-b border-gray-200 ${css(
              style.hourHeight
            )}`}
          >
            {displayStartTime.clone().add(idx, "hour").hour()}
          </div>
        )
      })}
    </>
  )
}
