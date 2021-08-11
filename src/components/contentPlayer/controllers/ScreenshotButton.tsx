import React, { memo } from "react"
import { Camera } from "react-feather"
import { useSetRecoilState } from "recoil"
import { contentPlayerScreenshotTriggerAtom } from "../../../atoms/contentPlayer"

export const CoiledScreenshotButton: React.VFC<{}> = memo(() => {
  const setScreenshotTrigger = useSetRecoilState(
    contentPlayerScreenshotTriggerAtom
  )

  return (
    <button
      aria-label="画面をキャプチャします"
      title="画面キャプチャ"
      type="button"
      className={`focus:outline-none cursor-pointer p-2 rounded-md bg-gray-800 text-gray-100`}
      onClick={() => setScreenshotTrigger(performance.now())}
    >
      <Camera className="pointer-events-none" size={22} />
    </button>
  )
})
