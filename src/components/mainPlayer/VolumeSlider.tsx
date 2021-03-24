import React, { useEffect, useState } from "react"
import { useDebounce } from "react-use"
import { useRecoilState } from "recoil"
import { mainPlayerVolume } from "../../atoms/mainPlayer"

export const VolumeSlider: React.VFC<{}> = () => {
  const [playerVolume, setPlayerVolume] = useRecoilState(mainPlayerVolume)
  const [volume, setVolume] = useState(playerVolume)

  useDebounce(
    () => {
      setPlayerVolume(volume)
    },
    100,
    [volume]
  )
  useEffect(() => {
    setVolume(playerVolume)
  }, [playerVolume])

  return (
    <input
      aria-label="音量"
      type="range"
      min="0"
      max="150"
      value={volume}
      onChange={(e) => {
        const p = parseInt(e.target.value)
        if (Number.isNaN(p)) return
        setVolume(p)
      }}
    />
  )
}
