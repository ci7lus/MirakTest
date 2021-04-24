import React, { useState } from "react"
import { useRecoilState } from "recoil"
import { experimentalSetting, screenshotSetting } from "../../../atoms/settings"
import { ExperimentalSettingForm } from "./Experimental"
import { ScreenshotSettingForm } from "./Screenshot"

export const CoiledGeneralSetting: React.VFC<{}> = () => {
  const [coiledScreenshotSetting, setCoiledScreenshotSetting] = useRecoilState(
    screenshotSetting
  )
  const [screenshot, setScreenshot] = useState(coiledScreenshotSetting)
  const [
    coiledExperimentalSetting,
    setCoiledExperimentalSetting,
  ] = useRecoilState(experimentalSetting)
  const [experimental, setExperimental] = useState(coiledExperimentalSetting)
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        setCoiledScreenshotSetting(screenshot)
        setExperimental(experimental)
      }}
    >
      <div className=" flex flex-col space-y-4">
        <ScreenshotSettingForm
          screenshotSetting={screenshot}
          setScreenshotSetting={setScreenshot}
        />
        <ExperimentalSettingForm
          experimentalSetting={experimental}
          setExperimentalSetting={setCoiledExperimentalSetting}
        />
      </div>
      <button
        type="submit"
        className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md"
      >
        保存
      </button>
    </form>
  )
}
