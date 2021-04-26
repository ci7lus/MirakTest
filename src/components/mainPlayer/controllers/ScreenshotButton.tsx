import React from "react"
import { Camera } from "react-feather"
import { useSetRecoilState } from "recoil"
import { mainPlayerScreenshotTrigger } from "../../../atoms/mainPlayer"

export const CoiledScreenshotButton: React.VFC<{}> = () => {
  const setScreenshotTrigger = useSetRecoilState(mainPlayerScreenshotTrigger)

  return (
    <button
      aria-label="画面をキャプチャします"
      title="画面キャプチャ"
      type="button"
      className={`focus:outline-none p-2 rounded-md bg-gray-800 text-gray-100`}
      onClick={() => setScreenshotTrigger(performance.now())}
    >
      <Camera size={22} />
    </button>
  )
}
