import React, { useState } from "react"
import { useDebounce } from "react-use"
import { ControllerSetting } from "../../../types/setting"

export const ControllerSettingForm: React.VFC<{
  controllerSetting: ControllerSetting
  setControllerSetting: React.Dispatch<React.SetStateAction<ControllerSetting>>
}> = ({ controllerSetting, setControllerSetting }) => {
  const [min, setMin] = useState(controllerSetting.volumeRange[0])
  const [max, setMax] = useState(controllerSetting.volumeRange[1])
  const [isEnableWaitForSingleTuner, setIsEnableWaitForSingleTuner] = useState(
    controllerSetting.isEnableWaitForSingleTuner
  )
  useDebounce(
    () => {
      setControllerSetting({
        volumeRange: [min, max],
        isEnableWaitForSingleTuner,
      })
    },
    100,
    [min, max, isEnableWaitForSingleTuner]
  )
  return (
    <div>
      <p className="text-lg">操作関連設定</p>
      <label className="block mt-4">
        <span>音量の範囲</span>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="0"
            className="block mt-2 form-input rounded-md w-24 text-gray-900"
            value={min}
            onChange={(e) => {
              const min = parseInt(e.target.value)
              if (Number.isNaN(min)) {
                return
              }
              setMin(min)
            }}
            min={0}
            max={max - 1}
          />
          <input
            type="number"
            placeholder="150"
            className="block mt-2 form-input rounded-md w-24 text-gray-900"
            value={max}
            onChange={(e) => {
              const max = parseInt(e.target.value)
              if (Number.isNaN(max)) {
                return
              }
              setMax(max)
            }}
            min={min + 1}
            max={200}
          />
        </div>
      </label>
      <label className="block mt-4">
        <span>チューナー切り替え前に待機する（シングルチューナー向け）</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isEnableWaitForSingleTuner || false}
          onChange={() => setIsEnableWaitForSingleTuner((enabled) => !enabled)}
        />
      </label>
    </div>
  )
}
