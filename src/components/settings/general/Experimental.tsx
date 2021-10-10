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
  const [vlcNetworkCaching, setVlcNetworkCaching] = useState(
    experimentalSetting.vlcNetworkCaching
  )
  useDebounce(
    () => {
      setExperimentalSetting({
        isWindowDragMoveEnabled,
        isProgramDetailInServiceSelectorEnabled,
        vlcNetworkCaching,
      })
    },
    100,
    [
      isWindowDragMoveEnabled,
      isProgramDetailInServiceSelectorEnabled,
      vlcNetworkCaching,
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
        <span className="text-sm text-gray-300 mt-2">
          ドラッグでウィンドウを移動できるようになりますが、たまに判定がおかしくなってウィンドウを離せなくなります。ウィンドウのどこかを左クリックで治まります。
        </span>
      </label>
      <label className="block mt-4">
        <span>VLC network caching</span>
        <input
          type="number"
          className="block mt-2 form-input rounded-md w-24 text-gray-900"
          value={vlcNetworkCaching ?? -1}
          onChange={(e) => {
            const value = parseInt(e.target.value)
            if (Number.isNaN(value)) {
              return
            }
            setVlcNetworkCaching(value)
          }}
          min={-1}
          max={60000}
        />
        <span className="text-sm text-gray-300 mt-2">
          VLCの引数に設定する
          <code className="font-mono bg-gray-500 mx-1">--network-caching</code>
          を指定します。
          <code className="font-mono bg-gray-500 mx-1">-1</code>
          を指定すると引数を渡さないようになります。
          新しいプレイヤーウィンドウから反映されます。
        </span>
      </label>
    </div>
  )
}
