import React, { memo, useEffect, useState } from "react"

export const PositionSlider: React.VFC<{
  position: number
  setPosition: React.Dispatch<React.SetStateAction<number>>
}> = memo(({ position, setPosition }) => {
  const [rangePosition, setRangePosition] = useState(position)

  useEffect(() => {
    if (position - rangePosition !== 0) {
      // ユーザー操作による位置更新である
      setPosition(rangePosition)
    }
  }, [rangePosition])
  useEffect(() => {
    setRangePosition(position)
  }, [position])

  return (
    <input
      className="w-full focus:outline-none cursor-pointer"
      aria-label="再生位置"
      type="range"
      min={0}
      max={100}
      value={rangePosition * 100}
      onChange={(e) => {
        const p = parseInt(e.target.value)
        if (Number.isNaN(p)) return
        setRangePosition(p / 100)
      }}
    />
  )
})
