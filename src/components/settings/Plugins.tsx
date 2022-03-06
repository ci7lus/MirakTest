import clsx from "clsx"
import React from "react"

export const CoiledPluginsSetting: React.VFC<{}> = () => {
  return (
    <div className={clsx("m-4")}>
      <h2 className={clsx("text-lg", "mb-2")}>プラグイン</h2>
      <ul>
        {window.plugins?.map((plugin) => (
          <li
            key={plugin.id}
            className={clsx("p-4", "bg-gray-700", "rounded-md", "mb-2")}
          >
            <h3 className={clsx("text-lg")}>
              {plugin.name} {plugin.version}
              {plugin.authorUrl ? (
                <a
                  className={clsx("text-sm", "text-gray-300", "ml-1")}
                  href={plugin.authorUrl}
                >
                  {plugin.author}
                </a>
              ) : (
                <span className={clsx("text-sm", "text-gray-300", "ml-1")}>
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
          </li>
        ))}
      </ul>
    </div>
  )
}
