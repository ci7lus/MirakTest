import clsx from "clsx"
import dayjs from "dayjs"
import React from "react"

export const WeekdaySelector: React.FC<{
  now: dayjs.Dayjs
  add: number
  setAdd: React.Dispatch<React.SetStateAction<number>>
}> = ({ now, add, setAdd }) => (
  <>
    {[...Array(7).keys()].map((i) => {
      const date = now.clone().add(i, "day")
      const weekday = date.format("dd")
      const color =
        weekday === "日"
          ? "text-red-400"
          : weekday === "土"
          ? "text-blue-400"
          : ""
      return (
        <button
          key={i}
          className={clsx(
            "shrink-0",
            "text-center",
            "p-2",
            "border-r-2",
            "border-gray-600",
            "truncate",
            "font-semibold",
            add === i ? "bg-gray-600" : "hover:bg-gray-700",
            color,
            "focus:outline-none",
            "cursor-pointer"
          )}
          type="button"
          onClick={() => {
            setAdd(i)
          }}
          disabled={add === i}
        >
          {date.format("D (dd)")}
        </button>
      )
    })}
  </>
)
