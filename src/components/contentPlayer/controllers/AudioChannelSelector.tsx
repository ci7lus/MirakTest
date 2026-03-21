import clsx from "clsx"
import React, { memo } from "react"

const VLCAudioChannel = { Stereo: 1, ReverseStereo: 2, Left: 3, Right: 4, Dolby: 5 } as const
const VLCAudioStereoChannel = { Monaural: 1, Original: 2, Stereo: 3, Headphone: 4 } as const
const VLCAudioChannelTranslated: Record<number, string> = {
  1: "ステレオ", 2: "反転ステレオ", 3: "左", 4: "右", 5: "ドルビー",
}
const VLCAudioChannelSurroundTranslated: Record<number, string> = {
  1: "モノラル", 2: "オリジナル", 3: "ステレオ", 4: "ヘッドフォン",
}

export const AudioChannelSelector: React.FC<{
  audioChannel: number
  setAudioChannel: React.Dispatch<React.SetStateAction<number>>
  isStereo: boolean
}> = memo(({ audioChannel, setAudioChannel, isStereo }) => (
  <select
    className={clsx(
      "appearance-none",
      "border",
      "border-gray-800",
      "rounded",
      "py-2",
      "px-2",
      "leading-tight",

      "bg-gray-800",
      "text-gray-100"
    )}
    value={audioChannel}
    onChange={(e) => {
      const selectedChannel = parseInt(e.target.value)
      if (Number.isNaN(selectedChannel)) return
      setAudioChannel(selectedChannel)
    }}
  >
    {Object.entries(isStereo ? VLCAudioChannel : VLCAudioStereoChannel).map(
      ([k, v]) => (
        <option key={k} value={v}>
          {isStereo
            ? VLCAudioChannelTranslated[v]
            : VLCAudioChannelSurroundTranslated[v]}
        </option>
      )
    )}
  </select>
))
