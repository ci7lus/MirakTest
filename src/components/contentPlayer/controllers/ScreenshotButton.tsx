import clsx from "clsx"
import React, { memo } from "react"
import { Camera } from "react-feather"
import { useSetRecoilState } from "recoil"
import { contentPlayerScreenshotTriggerAtom } from "../../../atoms/contentPlayer"

export const CoiledScreenshotButton: React.FC<{}> = memo(() => {
  const setScreenshotTrigger = useSetRecoilState(
    contentPlayerScreenshotTriggerAtom
  )

  return (
    <button
      aria-label="画面をキャプチャします"
      title="画面キャプチャ"
      type="button"
      className={clsx("p-2", "text-gray-100")}
      onClick={(e) =>
        setScreenshotTrigger(performance.now() * (e.altKey ? -1 : 1))
      }
    >
      <Camera className="pointer-events-none" size="1.75rem" />
    </button>
  )
})
