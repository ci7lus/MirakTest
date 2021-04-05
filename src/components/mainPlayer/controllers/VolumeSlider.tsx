import React, { useEffect, useState } from "react"
import { VolumeX, Volume1, Volume2 } from "react-feather"
import { useDebounce } from "react-use"

export const VolumeSlider: React.VFC<{
  volume: number
  setVolume: React.Dispatch<React.SetStateAction<number>>
}> = ({ volume, setVolume }) => {
  const [rangeVolume, setRangeVolume] = useState(volume)

  useDebounce(
    () => {
      setVolume(rangeVolume)
    },
    100,
    [rangeVolume]
  )
  useEffect(() => {
    setRangeVolume(volume)
  }, [volume])

  return (
    <div className="flex items-center justify-center space-x-1">
      <button
        type="button"
        className="focus:outline-none"
        onClick={() => setRangeVolume((volume) => (0 < volume ? 0 : 100))}
      >
        {rangeVolume === 0 ? (
          <VolumeX size={22} />
        ) : rangeVolume < 75 ? (
          <Volume1 size={22} />
        ) : (
          <Volume2 size={22} />
        )}
      </button>
      <input
        aria-label="音量"
        type="range"
        min="0"
        max="150"
        value={rangeVolume}
        onChange={(e) => {
          const p = parseInt(e.target.value)
          if (Number.isNaN(p)) return
          setRangeVolume(p)
        }}
      />
    </div>
  )
}
