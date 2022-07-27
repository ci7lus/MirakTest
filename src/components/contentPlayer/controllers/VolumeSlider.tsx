import clsx from "clsx"
import React, { memo, useEffect, useState } from "react"
import { VolumeX, Volume1, Volume2 } from "react-feather"
import { useDebounce } from "react-use"

export const VolumeSlider: React.FC<{
  volume: number
  setVolume: React.Dispatch<React.SetStateAction<number>>
  min: number
  max: number
}> = memo(({ volume, setVolume, min, max }) => {
  const [rangeVolume, setRangeVolume] = useState(volume)

  useDebounce(
    () => {
      setVolume(rangeVolume)
    },
    10,
    [rangeVolume]
  )
  useEffect(() => {
    setRangeVolume(volume)
  }, [volume])

  return (
    <div
      className={clsx("flex", "items-center", "justify-center", "space-x-1")}
    >
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => setRangeVolume((volume) => (0 < volume ? 0 : 100))}
      >
        {rangeVolume === 0 ? (
          <VolumeX className="pointer-events-none" size="1.75rem" />
        ) : rangeVolume < 75 ? (
          <Volume1 className="pointer-events-none" size="1.75rem" />
        ) : (
          <Volume2 className="pointer-events-none" size="1.75rem" />
        )}
      </button>
      <input
        className="cursor-pointer"
        aria-label="音量"
        type="range"
        min={min}
        max={max}
        value={rangeVolume}
        onChange={(e) => {
          const p = parseInt(e.target.value)
          if (Number.isNaN(p)) return
          setRangeVolume(p)
        }}
      />
    </div>
  )
})
