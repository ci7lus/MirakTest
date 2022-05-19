import clsx from "clsx"
import React from "react"
import { useRecoilState } from "recoil"
import { globalDisabledPluginFileNamesAtom } from "../../atoms/global"

export const CoiledPluginsSetting: React.VFC<{}> = () => {
  const [disabledFileNames, setDisabledFileNames] = useRecoilState(
    globalDisabledPluginFileNamesAtom
  )

  return (
    <div className={clsx("m-4")}>
      <h2 className={clsx("text-lg", "mb-2")}>プラグイン</h2>
      <ul>
        {window.plugins?.map((plugin) => (
          <li
            key={plugin.id}
            className={clsx(
              "p-4",
              "bg-gray-700",
              "rounded-md",
              "mb-2",
              "flex",
              "items-center",
              "space-x-2"
            )}
          >
            <input
              type="checkbox"
              className="block form-checkbox text-lg p-3 mr-3 ml-1 cursor-pointer flex-shrink-0"
              checked={!disabledFileNames.includes(plugin.fileName)}
              onChange={() => {
                let copied = structuredClone(disabledFileNames)
                if (disabledFileNames.includes(plugin.fileName)) {
                  copied = copied.filter(
                    (fileName) => fileName !== plugin.fileName
                  )
                } else {
                  copied.push(plugin.fileName)
                }
                setDisabledFileNames(copied)
              }}
              title={`${plugin.name}を切り替える`}
            />
            <div>
              <h3 className={clsx("text-lg")}>
                {plugin.name} {plugin.version}
                {plugin.authorUrl ? (
                  <a
                    className={clsx(
                      "text-sm",
                      "text-blue-400",
                      "ml-2",
                      "cursor-pointer"
                    )}
                    href={plugin.authorUrl}
                    target="_blank"
                  >
                    {plugin.author}
                  </a>
                ) : (
                  <span className={clsx("text-sm", "text-gray-300", "ml-2")}>
                    {plugin.author}
                  </span>
                )}
              </h3>
              <span className={clsx("text-sm", "text-gray-300", "select-text")}>
                {plugin.id}
              </span>
              <h4 className={clsx("mt-1")}>{plugin.description}</h4>
              {plugin.url && (
                <a
                  href={plugin.url}
                  target="_blank"
                  className={clsx(
                    "block",
                    "text-blue-400",
                    "text-sm",
                    "cursor-pointer",
                    "mt-1"
                  )}
                >
                  リンク
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <h3 className={clsx("text-base", "my-2")}>無効化されているプラグイン</h3>
      <ul>
        {window.disabledPluginFileNames?.map((plugin) => (
          <li
            key={plugin}
            className={clsx(
              "p-4",
              "bg-gray-700",
              "rounded-md",
              "mb-2",
              "flex",
              "items-center",
              "space-x-2"
            )}
          >
            <input
              type="checkbox"
              className="block form-checkbox text-lg p-3 mr-3 text-red-600 ml-1 cursor-pointer flex-shrink-0"
              checked={!disabledFileNames.includes(plugin)}
              onChange={() => {
                let copied = structuredClone(disabledFileNames)
                if (disabledFileNames.includes(plugin)) {
                  copied = copied.filter((fileName) => fileName !== plugin)
                } else {
                  copied.push(plugin)
                }
                setDisabledFileNames(copied)
              }}
              title={`${plugin}を切り替える`}
            />
            <div>
              <h3 className={clsx("text-lg")}>{plugin}</h3>
            </div>
          </li>
        ))}
      </ul>
      <p className={clsx("text-sm")}>
        チェックを入れたプラグインは次回再起動時に読み込まれます
      </p>
    </div>
  )
}
