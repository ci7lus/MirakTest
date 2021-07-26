import React, { memo } from "react"
import { Type } from "react-feather"

export const SubtitleToggleButton: React.VFC<{
  subtitleEnabled: boolean
  setSubtitleEnabled: React.Dispatch<React.SetStateAction<boolean>>
}> = memo(({ subtitleEnabled, setSubtitleEnabled }) => (
  <button
    aria-label={`字幕は${subtitleEnabled}です`}
    title="字幕切り替え"
    type="button"
    className={`focus:outline-none cursor-pointer p-2 rounded-md bg-gray-800 ${
      subtitleEnabled ? "text-gray-100" : "text-gray-500"
    }`}
    onClick={() => setSubtitleEnabled((value) => !value)}
  >
    <Type className="pointer-events-none" size={22} />
  </button>
))
