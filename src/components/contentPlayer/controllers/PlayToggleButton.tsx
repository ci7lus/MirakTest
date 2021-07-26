import React, { memo } from "react"
import { Pause, Play } from "react-feather"

export const PlayToggleButton: React.VFC<{
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}> = memo(({ isPlaying, setIsPlaying }) => (
  <button
    aria-label={`映像は${isPlaying ? "再生中" : "停止中"}`}
    title="再生切り替え"
    type="button"
    className={`focus:outline-none cursor-pointer p-2 rounded-md bg-gray-800`}
    onClick={() => setIsPlaying((value) => !value)}
  >
    {isPlaying ? (
      <Pause className="pointer-events-none" size={22} />
    ) : (
      <Play className="pointer-events-none" size={22} />
    )}
  </button>
))
