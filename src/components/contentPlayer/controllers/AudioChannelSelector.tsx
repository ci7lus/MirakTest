import React, { memo } from "react"
import { VLCAudioChannel, VLCAudioChannelTranslated } from "../../../utils/vlc"

export const AudioChannelSelector: React.VFC<{
  audioChannel: number
  setAudioChannel: React.Dispatch<React.SetStateAction<number>>
}> = memo(({ audioChannel, setAudioChannel }) => (
  <select
    className="appearance-none border border-gray-800 rounded py-2 px-2 leading-tight focus:outline-none bg-gray-800 text-gray-100"
    value={audioChannel}
    onChange={(e) => {
      const selectedChannel = parseInt(e.target.value)
      if (Number.isNaN(selectedChannel)) return
      setAudioChannel(selectedChannel)
    }}
  >
    {Object.entries(VLCAudioChannel).map(([k, v]) => (
      <option key={k} value={v}>
        {VLCAudioChannelTranslated[v]}
      </option>
    ))}
  </select>
))
