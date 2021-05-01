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
  const [
    isProgramDetailInServiceSelectorEnabled,
    setIsProgramDetailInServiceSelectorEnabled,
  ] = useState(experimentalSetting.isProgramDetailInServiceSelectorEnabled)
  useDebounce(
    () => {
      setExperimentalSetting({
        isWindowDragMoveEnabled,
        isProgramDetailInServiceSelectorEnabled,
      })
    },
    100,
    [isWindowDragMoveEnabled, isProgramDetailInServiceSelectorEnabled]
  )
  return (
    <div>
      <p className="text-lg">試験的な設定</p>
      <label className="block mt-4">
        <span>サービスセレクターに番組情報を表示する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isProgramDetailInServiceSelectorEnabled || false}
          onChange={() =>
            setIsProgramDetailInServiceSelectorEnabled((enabled) => !enabled)
          }
        />
      </label>
      <label className="block mt-4">
        <span>ウィンドウをドラッグで移動する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isWindowDragMoveEnabled || false}
          onChange={() => setIsWindowDragMoveEnabled((enabled) => !enabled)}
        />
      </label>
    </div>
  )
}
