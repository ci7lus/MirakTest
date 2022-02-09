import clsx from "clsx"
import React, { useEffect, useState } from "react"

export const SpeedSelector = ({
  isSeekable,
  speed,
  setSpeed,
}: {
  isSeekable: boolean
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
}) => {
  const [local, setLocal] = useState(speed)
  const [isInvalid, setIsInvalid] = useState(false)
  useEffect(() => {
    if (local < 0.1 || local > 5) {
      setIsInvalid(true)
      return
    }
    setIsInvalid(false)
    setSpeed(local)
  }, [local])
  return (
    <input
      type="number"
      className={clsx(
        "block form-input rounded-md text-gray-200",
        isSeekable && !isInvalid ? "bg-gray-800" : "bg-gray-500"
      )}
      value={local}
      step={0.1}
      max={5}
      min={0.1}
      onChange={(e) => {
        const value = parseFloat(e.target.value)
        if (Number.isNaN(value)) {
          return
        }
        setLocal(value)
      }}
      disabled={!isSeekable}
      onKeyDown={(e) => e.stopPropagation()}
    />
  )
}
