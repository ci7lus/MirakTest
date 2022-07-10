import clsx from "clsx"
import formatDuration from "format-duration"
import React, { memo, useCallback, useEffect, useState } from "react"
import { FastForward, Rewind, SkipBack } from "react-feather"
import { useDebounce } from "react-use"

export const SeekableControl: React.FC<{
  time: number
  position: number
  setPosition: React.Dispatch<React.SetStateAction<number>>
  duration?: number
  seekRequest: number | null
  setSeekRequest: React.Dispatch<React.SetStateAction<number | null>>
}> = memo(
  ({ time, position, setPosition, duration, seekRequest, setSeekRequest }) => {
    const [isPreview, setIsPreview] = useState(false)
    const [previewPosition, setPreviewPosition] = useState(0)

    const relativeMove = useCallback(
      (relativeMs: number) => {
        if (!duration) {
          return
        }
        setPosition((position * duration + relativeMs) / duration)
      },
      [position, duration]
    )

    useEffect(() => {
      if (!seekRequest) {
        return
      }
      relativeMove(seekRequest)
      setSeekRequest(null)
    }, [seekRequest])

    const [pastDuration, setPastDuration] = useState("0:00")
    useDebounce(
      () => {
        setPastDuration(
          isPreview ? formatDuration(previewPosition) : formatDuration(time)
        )
      },
      30,
      [isPreview, previewPosition, time]
    )

    return (
      <div className="w-full flex items-center space-x-2 px-2">
        <div
          className={clsx(
            "shrink-0",
            "text-base",
            "font-bold",
            "font-mono",
            "text-center",
            // 1時間以上
            duration && 3600000 <= duration ? "w-16" : "w-10",
            isPreview && "text-gray-300"
          )}
        >
          {pastDuration}
        </div>
        <div className={clsx("flex", "items-center")}>
          <button
            type="button"
            title="最初から再生"
            aria-label="最初から再生"
            className={clsx("p-2")}
            onClick={() => setPosition(0)}
          >
            <SkipBack className="pointer-events-none" size="1.5rem" />
          </button>
          <button
            type="button"
            title="10秒戻す"
            aria-label="10秒戻す"
            className={clsx("p-2", "flex", "flex-col", "items-center")}
            onClick={() => relativeMove(-10_000)}
          >
            <Rewind className="pointer-events-none" size="1.5rem" />
            <span
              className={clsx("text-xs", "text-center", "pointer-events-none")}
            >
              -10
            </span>
          </button>
          <button
            type="button"
            title="30秒進む"
            aria-label="30秒進む"
            className={clsx("p-2", "flex", "flex-col", "items-center")}
            onClick={() => relativeMove(30_000)}
          >
            <FastForward className="pointer-events-none" size="1.5rem" />
            <span
              className={clsx("text-xs", "text-center", "pointer-events-none")}
            >
              +30
            </span>
          </button>
        </div>
        <input
          className="w-full focus:outline-none"
          aria-label="再生位置"
          type="range"
          min={0}
          max={100}
          value={position * 100}
          readOnly={true}
          onClick={(event) => {
            const { left, width } = event.currentTarget.getBoundingClientRect()
            const pos = event.pageX - left - window.pageXOffset
            const seekTo = Math.max(pos / width, 0)
            setPosition(seekTo)
          }}
          onMouseEnter={() => {
            duration && setIsPreview(true)
          }}
          onMouseMove={(event) => {
            if (!duration) {
              return
            }
            const { left, width } = event.currentTarget.getBoundingClientRect()
            const pos = event.pageX - left - window.pageXOffset
            const seekTo = Math.max(Math.round((pos / width) * duration), 0)
            setPreviewPosition(seekTo)
          }}
          onMouseLeave={() => {
            setIsPreview(false)
          }}
        />
      </div>
    )
  }
)
