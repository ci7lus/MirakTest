import React, { useState } from "react"
import { useDebounce } from "react-use"
import { ExperimentalSetting } from "../../../types/setting"

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
  const [isRichPresenceEnabled, setIsRichPresenceEnabled] = useState(
    experimentalSetting.isRichPresenceEnabled
  )
  useDebounce(
    () => {
      setExperimentalSetting({
        isWindowDragMoveEnabled,
        isProgramDetailInServiceSelectorEnabled,
        isRichPresenceEnabled,
      })
    },
    100,
    [
      isWindowDragMoveEnabled,
      isProgramDetailInServiceSelectorEnabled,
      isRichPresenceEnabled,
    ]
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
      <label className="block mt-4">
        <span>Discord のプロフィールに視聴中の番組を共有する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isRichPresenceEnabled || false}
          onChange={() => setIsRichPresenceEnabled((enabled) => !enabled)}
        />
      </label>
    </div>
  )
}
