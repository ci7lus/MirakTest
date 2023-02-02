import clsx from "clsx"
import React, { useMemo } from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import { windowRootFontSizeAtom } from "../../atoms/window"

const OUTER_R = 5 / 2
const STROKE_WIDTH = 0.4

export const CoiledLoadingCircle: React.FC<{ percentage: number }> = ({
  percentage,
}) => {
  const rootFontSize = useRecoilValue(windowRootFontSizeAtom)
  const r = useMemo(() => OUTER_R - STROKE_WIDTH, [])
  const circumreference = useMemo(
    () => r * rootFontSize * 2 * Math.PI,
    [rootFontSize]
  )
  const [internalPercent, setInternalPercent] = useState(percentage)
  useEffect(() => {
    setInternalPercent(percentage)
    if (percentage === 100) {
      const timeout = setTimeout(() => {
        setInternalPercent(0)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [percentage])
  return (
    <svg className={clsx("-rotate-90", "w-20", "h-20")}>
      <circle
        className={clsx("text-gray-800", "opacity-30")}
        stroke-width={`${STROKE_WIDTH}rem`}
        stroke="currentColor"
        fill="transparent"
        r={`${r}rem`}
        cx={`${OUTER_R}rem`}
        cy={`${OUTER_R}rem`}
      ></circle>
      <circle
        className={clsx(
          "text-blue-100",
          "transition-strokeDashoffset",
          "duration-150",
          "ease-in-out"
        )}
        stroke-width={`${STROKE_WIDTH}rem`}
        stroke-linecap="round"
        stroke="currentColor"
        fill="transparent"
        r={`${r}rem`}
        cx={`${OUTER_R}rem`}
        cy={`${OUTER_R}rem`}
        stroke-dasharray={circumreference}
        stroke-dashoffset={circumreference * ((100 - internalPercent) / 100)}
      ></circle>
    </svg>
  )
}
