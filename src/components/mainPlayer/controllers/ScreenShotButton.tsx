import React from "react"
import { Camera } from "react-feather"
import { useSetRecoilState } from "recoil"
import { mainPlayerScreenShotTrigger } from "../../../atoms/mainPlayer"

export const CoiledScreenShotButton: React.VFC<{}> = () => {
  const setScreenShotTrigger = useSetRecoilState(mainPlayerScreenShotTrigger)

  return (
    <button
      aria-label="画面をキャプチャします"
      title="画面キャプチャ"
      type="button"
      className={`focus:outline-none p-2 rounded-md bg-gray-800 text-gray-100`}
      onClick={() => setScreenShotTrigger(new Date().getTime())}
    >
      <Camera size={22} />
    </button>
  )
}
