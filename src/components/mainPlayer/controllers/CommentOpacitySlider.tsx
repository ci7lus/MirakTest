import React, { memo, useEffect, useState } from "react"
import { MessageSquare } from "react-feather"
import { useDebounce } from "react-use"

export const CommentOpacitySlider: React.VFC<{
  commentOpacity: number
  setCommentOpacity: React.Dispatch<React.SetStateAction<number>>
}> = memo(({ commentOpacity, setCommentOpacity }) => {
  const [rangeOpacity, setRangeOpacity] = useState(commentOpacity * 10)

  useDebounce(
    () => {
      setCommentOpacity(rangeOpacity / 10)
    },
    100,
    [rangeOpacity]
  )
  useEffect(() => {
    setRangeOpacity(commentOpacity * 10)
  }, [commentOpacity])

  return (
    <div className="flex items-center justify-center space-x-1">
      <button
        type="button"
        className="focus:outline-none cursor-pointer"
        onClick={() => setCommentOpacity((opacity) => (0 < opacity ? 0 : 0.8))}
      >
        <MessageSquare className="pointer-events-none" size={22} />
      </button>
      <input
        aria-label="コメント濃度"
        className="focus:outline-none cursor-pointer"
        type="range"
        min="0"
        max="10"
        value={rangeOpacity}
        onChange={(e) => {
          const p = parseInt(e.target.value)
          if (Number.isNaN(p)) return
          setRangeOpacity(p)
        }}
      />
    </div>
  )
})
