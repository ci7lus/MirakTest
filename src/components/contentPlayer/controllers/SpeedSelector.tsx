import clsx from "clsx"
import React from "react"

export const SpeedSelector = ({
  isSeekable,
  speed,
  setSpeed,
}: {
  isSeekable: boolean
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
}) => {
  return (
    <input
      type="number"
      className={clsx(
        "block form-input rounded-md text-gray-200",
        isSeekable ? "bg-gray-800" : "bg-gray-600"
      )}
      value={speed}
      step={0.1}
      max={3}
      min={1}
      onChange={(e) => {
        const value = parseFloat(e.target.value)
        if (Number.isNaN(value)) {
          return
        }
        setSpeed(value)
      }}
      disabled={!isSeekable}
      onKeyDown={(e) => e.stopPropagation()}
    />
  )
}
