import clsx from "clsx"
import React, { memo } from "react"
import { Type } from "react-feather"

export const SubtitleToggleButton: React.FC<{
  subtitleEnabled: boolean
  setSubtitleEnabled: React.Dispatch<React.SetStateAction<boolean>>
}> = memo(({ subtitleEnabled, setSubtitleEnabled }) => (
  <button
    aria-label={`字幕は${subtitleEnabled}です`}
    title="字幕切り替え"
    type="button"
    className={clsx("p-2", subtitleEnabled ? "text-gray-100" : "text-gray-500")}
    onClick={() => setSubtitleEnabled((value) => !value)}
  >
    <Type className="pointer-events-none" size="1.75rem" />
  </button>
))
