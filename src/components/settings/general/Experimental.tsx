import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { Command } from "react-feather"
import { ExperimentalSetting } from "../../../types/setting"

const META_KEYS = ["Control", "Shift", "Meta", "Alt"]

const ESCAPE = ["Escape", "Enter", "Backspace", "Delete", " "]

export const ExperimentalSettingForm: React.FC<{
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
  const [isSurroundAutoAdjustEnabeld, setIsSurroundAutoAdjustEnabeld] =
    useState(experimentalSetting.isSurroundAutoAdjustEnabeld)
  const [globalScreenshotAccelerator, setGlobalScreenshotAccelerator] =
    useState(experimentalSetting.globalScreenshotAccelerator)
  const [isCodeBlack, setIsCodeBlack] = useState(
    experimentalSetting.isCodeBlack
  )
  useEffect(() => {
    setExperimentalSetting({
      isWindowDragMoveEnabled,
      vlcNetworkCaching,
      isVlcAvCodecHwAny,
      isDualMonoAutoAdjustEnabled,
      isSurroundAutoAdjustEnabeld,
      globalScreenshotAccelerator,
      isCodeBlack,
    })
  }, [
    isWindowDragMoveEnabled,
    vlcNetworkCaching,
    isVlcAvCodecHwAny,
    isDualMonoAutoAdjustEnabled,
    globalScreenshotAccelerator,
    isCodeBlack,
  ])
  const [isKeyboradCaptureing, setIsKeyboardCaptureing] = useState(false)
  return (
    <div>
      <p className="text-lg">試験的な設定</p>
      <label className={clsx("block", "mt-4")}>
        <span>デュアルモノを自動で切り替える</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={isDualMonoAutoAdjustEnabled}
          onChange={() => setIsDualMonoAutoAdjustEnabled((enabled) => !enabled)}
        />
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          左右で言語が異なる音声を流している番組を検知した際に、自動で切り替えます。
        </p>
      </label>
      <label className={clsx("block", "mt-4")}>
        <span>サラウンドに対する修正を有効にする</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={isSurroundAutoAdjustEnabeld}
          onChange={() => setIsSurroundAutoAdjustEnabeld((enabled) => !enabled)}
        />
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          サラウンドの音声が正常に再生されない可能性がある問題を修正しますが、実験中のため他の不具合が生じることがあります。
        </p>
      </label>
      {process.platform !== "darwin" && (
        <label className={clsx("block", "mt-4")}>
          <span>ウィンドウをドラッグで移動する</span>
          <input
            type="checkbox"
            className={clsx("block", "mt-2", "form-checkbox")}
            checked={isWindowDragMoveEnabled || false}
            onChange={() => setIsWindowDragMoveEnabled((enabled) => !enabled)}
          />
          <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
            ドラッグでウィンドウを移動できるようになりますが、たまに判定がおかしくなってウィンドウを離せなくなります。ウィンドウのどこかを左クリックで治まります。
          </p>
        </label>
      )}
      <label className={clsx("block", "mt-4")}>
        <span>VLC network caching</span>
        <input
          type="number"
          className={clsx(
            "block",
            "mt-2",
            "form-input",
            "rounded-md",
            "w-24",
            "text-gray-900"
          )}
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
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          VLCの引数に設定する
          <code className={clsx("font-mono", "bg-gray-500", "mx-1")}>
            --network-caching
          </code>
          を指定します。
          <code className={clsx("font-mono", "bg-gray-500", "mx-1")}>-1</code>
          を指定すると引数を渡さないようになります。
          新しいプレイヤーウィンドウから反映されます。
        </p>
      </label>
      <label className={clsx("block", "mt-4")}>
        <span>VLC AvCodec Hw</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={isVlcAvCodecHwAny || false}
          onChange={() => setIsVlcAvCodecHwAny((enabled) => !enabled)}
        />
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          VLCの引数に
          <code className={clsx("font-mono", "bg-gray-500", "mx-1")}>
            --avcodec-hw=any
          </code>
          を指定します。効果は不明の上に、gstreamerを用いる一部ディストリビューションでは動作が不安定になる可能性があります。
        </p>
      </label>
      <label className={clsx("block", "mt-4")}>
        <span>グローバルスクリーンショットキー</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={globalScreenshotAccelerator !== false}
          onChange={() =>
            setGlobalScreenshotAccelerator((accelerator) =>
              typeof accelerator !== "string" ? "F4" : false
            )
          }
        />
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          他のアプリにフォーカスがあってもスクリーンショットを撮ることができますが、適用中はすべての入力が吸い取られます。
        </p>
        {globalScreenshotAccelerator !== false && (
          <>
            <div className={clsx("flex", "justify-center", "flex-grow")}>
              <input
                type="text"
                placeholder="F4"
                className={clsx(
                  "block mt-2 form-input rounded-l-md w-full text-gray-900"
                )}
                value={globalScreenshotAccelerator || ""}
                onChange={(e) => setGlobalScreenshotAccelerator(e.target.value)}
                spellCheck={false}
              />
              <button
                className={clsx(
                  "px-4",
                  "py-2",
                  "mt-2",
                  "rounded-r-md",
                  "flex",
                  "items-center",
                  "justify-center",
                  "bg-gray-100",
                  "text-gray-900",
                  isKeyboradCaptureing && "bg-gray-400 cursor-not-allowed"
                )}
                disabled={isKeyboradCaptureing}
                onClick={() => {
                  const capture = (e: KeyboardEvent) => {
                    e.preventDefault()
                    if (!ESCAPE.includes(e.key)) {
                      setGlobalScreenshotAccelerator(() =>
                        [
                          e.altKey && "Alt",
                          e.metaKey
                            ? "CommandOrControl"
                            : e.ctrlKey && "Control",
                          e.shiftKey && "Shift",
                          META_KEYS.includes(e.key)
                            ? " "
                            : e.code.replace("Key", ""),
                        ]
                          .filter((s) => s)
                          .join("+")
                          .trim()
                      )
                    }
                    if (!META_KEYS.includes(e.key)) {
                      document.removeEventListener("keydown", capture)
                      setIsKeyboardCaptureing(false)
                    }
                  }
                  document.addEventListener("keydown", capture)
                  setIsKeyboardCaptureing(true)
                }}
                type="button"
              >
                <Command className="pointer-events-none" size="1.75rem" />
              </button>
            </div>
            <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
              <Command size=".75rem" className="inline" />{" "}
              を押してキーコンビネーションをキャプチャできます。Esc/Backspace/Enterなどでキャンセルできます。
            </p>
          </>
        )}
      </label>
      <label className={clsx("block", "mt-4")}>
        <span>背景色を黒にする</span>
        <input
          type="checkbox"
          className={clsx("block", "mt-2", "form-checkbox")}
          checked={isCodeBlack}
          onChange={() => setIsCodeBlack((enabled) => !enabled)}
        />
        <p className={clsx("text-sm", "text-gray-300", "mt-2")}>
          背景色を黒(
          <code className={clsx("font-mono", "bg-black", "mx-1")}>#00000</code>
          )にします。再起動後に反映されます。
        </p>
      </label>
    </div>
  )
}
