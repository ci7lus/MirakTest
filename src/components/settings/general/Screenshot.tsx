import React, { useState } from "react"
import { File } from "react-feather"
import clsx from "clsx"
import { ScreenShotSetting } from "../../../types/struct"
import { useDebounce } from "react-use"
import { remote } from "electron"

export const ScreenshotSettingForm: React.VFC<{
  screenshotSetting: ScreenShotSetting
  setScreenshotSetting: React.Dispatch<React.SetStateAction<ScreenShotSetting>>
}> = ({ screenshotSetting, setScreenshotSetting }) => {
  const [saveAsAFile, setSaveAsAFile] = useState(screenshotSetting.saveAsAFile)
  const [basePath, setBasePath] = useState(screenshotSetting.basePath)
  useDebounce(
    () => {
      setScreenshotSetting({ saveAsAFile, basePath })
    },
    100,
    [saveAsAFile, basePath]
  )
  return (
    <>
      <p className="text-lg">スクリーンショットの設定</p>
      <label className="block">
        <span>ファイルに保存する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={saveAsAFile || false}
          onChange={() => setSaveAsAFile((enabled) => !enabled)}
        />
      </label>
      <label className="mb-2 block">
        <span>保存するフォルダ</span>
        <div className="flex justify-center flex-grow">
          <input
            type="text"
            placeholder="/Users/User/Pictures"
            className={clsx(
              "block mt-2 form-input rounded-l-md w-full text-gray-900",
              !saveAsAFile && "bg-gray-600"
            )}
            value={basePath || ""}
            onChange={(e) => saveAsAFile && setBasePath(e.target.value)}
            disabled={!saveAsAFile}
            spellCheck={false}
          />
          <button
            className={clsx(
              `px-4 py-2 mt-2 rounded-r-md flex items-center justify-center bg-gray-100 text-gray-900`,
              !saveAsAFile && "bg-gray-600"
            )}
            disabled={!saveAsAFile}
            onClick={async () => {
              if (!saveAsAFile) return
              const dialog = await remote.dialog.showOpenDialog({
                properties: ["openDirectory", "createDirectory"],
                defaultPath: basePath || undefined,
              })

              if (dialog.canceled) return
              const path = dialog.filePaths.shift()
              if (!path) return
              setBasePath(path)
            }}
          >
            <File size={20} />
          </button>
        </div>
      </label>
    </>
  )
}
