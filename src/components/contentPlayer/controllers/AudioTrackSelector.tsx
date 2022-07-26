import clsx from "clsx"
import React, { memo } from "react"

export const AudioTrackSelector: React.FC<{
  audioTrack: number
  setAudioTrack: React.Dispatch<React.SetStateAction<number>>
  audioTracks: string[]
}> = memo(({ audioTrack, setAudioTrack, audioTracks }) => (
  <select
    className={clsx(
      "appearance-none",
      "border",
      "border-gray-800",
      "rounded",
      "py-2",
      "px-2",
      "leading-tight",
      "focus:outline-none",
      "bg-gray-800",
      "text-gray-100"
    )}
    value={audioTrack}
    onChange={(e) => {
      const selectedTrack = parseInt(e.target.value)
      if (Number.isNaN(selectedTrack)) return
      setAudioTrack(selectedTrack)
    }}
  >
    {audioTracks.map((trackName, i) => {
      if (i === 0) return <React.Fragment key={i}></React.Fragment>
      return (
        <option key={i} value={i}>
          {trackName.replace("Track", "トラック")}
        </option>
      )
    })}
  </select>
))
