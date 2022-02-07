import React, { useEffect, useState } from "react"
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
  const [vlcNetworkCaching, setVlcNetworkCaching] = useState(
    experimentalSetting.vlcNetworkCaching
  )
  const [isVlcAvCodecHwAny, setIsVlcAvCodecHwAny] = useState(
    experimentalSetting.isVlcAvCodecHwAny
  )
  const [isDualMonoAutoAdjustEnabled, setIsDualMonoAutoAdjustEnabled] =
    useState(experimentalSetting.isDualMonoAutoAdjustEnabled)
  useEffect(() => {
    setExperimentalSetting({
      isWindowDragMoveEnabled,
      vlcNetworkCaching,
      isVlcAvCodecHwAny,
      isDualMonoAutoAdjustEnabled,
    })
  }, [
    isWindowDragMoveEnabled,
    vlcNetworkCaching,
    isVlcAvCodecHwAny,
    isDualMonoAutoAdjustEnabled,
  ])
  return (
    <div>
      <p className="text-lg">試験的な設定</p>
      <label className="block mt-4">
        <span>デュアルモノを自動で切り替える</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isDualMonoAutoAdjustEnabled}
          onChange={() => setIsDualMonoAutoAdjustEnabled((enabled) => !enabled)}
        />
        <p className="text-sm text-gray-300 mt-2">
          左右で言語が異なる音声を流している番組を検知した際に、自動で切り替えます。
        </p>
      </label>
      <label className="block mt-4">
        <span>ウィンドウをドラッグで移動する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isWindowDragMoveEnabled || false}
          onChange={() => setIsWindowDragMoveEnabled((enabled) => !enabled)}
        />
        <p className="text-sm text-gray-300 mt-2">
          ドラッグでウィンドウを移動できるようになりますが、たまに判定がおかしくなってウィンドウを離せなくなります。ウィンドウのどこかを左クリックで治まります。
        </p>
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
        <p className="text-sm text-gray-300 mt-2">
          VLCの引数に設定する
          <code className="font-mono bg-gray-500 mx-1">--network-caching</code>
          を指定します。
          <code className="font-mono bg-gray-500 mx-1">-1</code>
          を指定すると引数を渡さないようになります。
          新しいプレイヤーウィンドウから反映されます。
        </p>
      </label>
      <label className="block mt-4">
        <span>VLC AvCodec Hw</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isVlcAvCodecHwAny || false}
          onChange={() => setIsVlcAvCodecHwAny((enabled) => !enabled)}
        />
        <p className="text-sm text-gray-300 mt-2">
          VLCの引数に
          <code className="font-mono bg-gray-500 mx-1">--avcodec-hw=any</code>
          を指定します。効果は不明の上に、gstreamerを用いる一部ディストリビューションでは動作が不安定になる可能性があります。
        </p>
      </label>
    </div>
  )
}
