import React, { useState } from "react"
import { ExperimentalSetting } from "../../../types/struct"
import { useDebounce } from "react-use"

export const ExperimentalSettingForm: React.VFC<{
  experimentalSetting: ExperimentalSetting
  setExperimentalSetting: React.Dispatch<
    React.SetStateAction<ExperimentalSetting>
  >
}> = ({ experimentalSetting, setExperimentalSetting }) => {
  const [isWindowDragMoveEnabled, setIsWindowDragMoveEnabled] = useState(
    experimentalSetting.isWindowDragMoveEnabled
  )
  useDebounce(
    () => {
      setExperimentalSetting({ isWindowDragMoveEnabled })
    },
    100,
    [isWindowDragMoveEnabled]
  )
  return (
    <>
      <p className="text-lg">試験的な設定</p>
      <label className="block">
        <span>ウィンドウをドラッグで移動する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isWindowDragMoveEnabled || false}
          onChange={() => setIsWindowDragMoveEnabled((enabled) => !enabled)}
        />
      </label>
    </>
  )
}
