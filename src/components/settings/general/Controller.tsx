import clsx from "clsx"
import React, { useState } from "react"
import { useDebounce } from "react-use"
import { ControllerSetting } from "../../../types/setting"

export const ControllerSettingForm: React.FC<{
  controllerSetting: ControllerSetting
  setControllerSetting: React.Dispatch<React.SetStateAction<ControllerSetting>>
}> = ({ controllerSetting, setControllerSetting }) => {
  const [min, setMin] = useState(controllerSetting.volumeRange[0])
  const [max, setMax] = useState(controllerSetting.volumeRange[1])
  const [isVolumeWheelDisabled, setIsVolumeWheelDisabled] = useState(
    controllerSetting.isVolumeWheelDisabled
  )
  useDebounce(
    () => {
      setControllerSetting({
        volumeRange: [min, max],
        isVolumeWheelDisabled,
      })
    },
    100,
    [min, max, isVolumeWheelDisabled]
  )
  return (
    <div>
      <p className="text-lg">操作関連設定</p>
      <label className={clsx("block", "mt-4")}>
        <span>音量の範囲</span>
        <div className={clsx("flex", "space-x-2")}>
          <input
            type="number"
            placeholder="0"
            className={clsx(
              "block",
              "mt-2",
              "form-input",
              "rounded-md",
              "w-24",
              "text-gray-900"
            )}
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
            className={clsx(
              "block",
              "mt-2",
              "form-input",
              "rounded-md",
              "w-24",
              "text-gray-900"
            )}
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
      <label className={clsx("block", "mt-4")}>
        <span>ホイールでの音量変更を無効化する</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={isVolumeWheelDisabled || false}
          onChange={() => setIsVolumeWheelDisabled((i) => !i)}
        />
      </label>
    </div>
  )
}
