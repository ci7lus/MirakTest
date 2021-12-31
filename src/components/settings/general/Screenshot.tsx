import clsx from "clsx"
import React, { useState } from "react"
import { File } from "react-feather"
import { useDebounce } from "react-use"
import { ScreenshotSetting } from "../../../types/setting"

export const ScreenshotSettingForm: React.VFC<{
  screenshotSetting: ScreenshotSetting
  setScreenshotSetting: React.Dispatch<React.SetStateAction<ScreenshotSetting>>
}> = ({ screenshotSetting, setScreenshotSetting }) => {
  const [saveAsAFile, setSaveAsAFile] = useState(screenshotSetting.saveAsAFile)
  const [includeSubtitle, setIncludeSubtitle] = useState(
    screenshotSetting.includeSubtitle
  )
  const [basePath, setBasePath] = useState(screenshotSetting.basePath)
  useDebounce(
    () => {
      setScreenshotSetting({ saveAsAFile, basePath, includeSubtitle })
    },
    100,
    [saveAsAFile, basePath, includeSubtitle]
  )
  return (
    <div>
      <p className="text-lg">スクリーンショットの設定</p>
      <label className="block mt-4">
        <span>ファイルに保存する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={saveAsAFile || false}
          onChange={() => setSaveAsAFile((enabled) => !enabled)}
        />
      </label>
      <label className="block mt-4">
        <span>スクリーンショットに字幕を含める</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={includeSubtitle || false}
          onChange={() => setIncludeSubtitle((enabled) => !enabled)}
        />
      </label>
      <label className="mt-4 mb-2 block">
        <span>保存するフォルダ</span>
        <div className="flex justify-center flex-grow">
          <input
            type="text"
            placeholder="/Users/User/Pictures"
            className={clsx(
              "block mt-2 form-input rounded-l-md w-full text-gray-900 focus:outline-none cursor-pointer",
              !saveAsAFile && "bg-gray-600"
            )}
            value={basePath || ""}
            onChange={(e) => saveAsAFile && setBasePath(e.target.value)}
            disabled={!saveAsAFile}
            spellCheck={false}
          />
          <button
            className={clsx(
              `px-4 py-2 mt-2 rounded-r-md flex items-center justify-center bg-gray-100 text-gray-900 focus:outline-none cursor-pointer`,
              !saveAsAFile && "bg-gray-600"
            )}
            disabled={!saveAsAFile}
            onClick={async () => {
              if (!saveAsAFile) return
              const dialog = await window.Preload.public.requestDialog({
                properties: ["openDirectory", "createDirectory"],
                defaultPath: basePath || undefined,
              })

              if (dialog.canceled) return
              const path = dialog.filePaths.slice(0).shift()
              if (!path) return
              setBasePath(path)
            }}
          >
            <File className="pointer-events-none" size="1.75rem" />
          </button>
        </div>
      </label>
    </div>
  )
}
