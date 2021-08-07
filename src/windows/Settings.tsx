import path from "path"
import { remote } from "electron"
import React, { useEffect, useState } from "react"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil"
import { ComponentShadowWrapper } from "../components/common/ComponentShadowWrapper"
import { MirakurunSettingForm } from "../components/settings/Mirakurun"
import { SayaSettingForm } from "../components/settings/Saya"
import { CoiledGeneralSetting } from "../components/settings/general"
import { OnSettingComponent } from "../types/plugin"
import { store } from "../utils/store"

type Routes = "General" | "Mirakurun" | "Saya" | (string & {})

const Right: React.FC = ({ children }) => (
  <div className="h-full w-2/3 my-4p-4 text-gray-100 overflow-auto">
    {children}
  </div>
)

const Router: React.VFC<{ route: Routes }> = ({ route }) => {
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE()
  if (route === "General") {
    return (
      <Right>
        <CoiledGeneralSetting />
      </Right>
    )
  } else if (route === "Mirakurun") {
    return (
      <Right>
        <MirakurunSettingForm />
      </Right>
    )
  } else if (route === "Saya") {
    return (
      <Right>
        <SayaSettingForm />
      </Right>
    )
  } else {
    const plugin = window.plugins
      ?.find((plugin) =>
        plugin.components.find((component) => component.id === route)
      )
      ?.components?.find((component) => component.id === route)
    if (plugin?.component) {
      return (
        <ComponentShadowWrapper
          _id={plugin.id}
          className="h-full w-2/3 my-4p-4 text-gray-100 overflow-auto"
          Component={() => (
            <RecoilBridge>
              <plugin.component />
            </RecoilBridge>
          )}
        />
      )
    }
    return (
      <Right>
        <p className="p-2">その設定項目はありません（参照エラー）</p>
      </Right>
    )
  }
}

export const Settings: React.VFC<{}> = () => {
  const [route, setRoute] = useState<Routes>("General")
  const [aditionalRoutes, setAditionalRoutes] = useState<[string, string][]>([])
  useEffect(() => {
    const browserWindow = remote.getCurrentWindow()
    browserWindow.setTitle(`設定 - ${remote.app.name}`)
    browserWindow.show()
    try {
      const plugins: [string, string][] =
        window.plugins
          ?.map(
            (plugin) =>
              plugin.components?.filter(
                (component): component is OnSettingComponent =>
                  component.position === "onSetting"
              ) || []
          )
          .flat()
          .map((component) => [component.id, component.label]) || []
      setAditionalRoutes(plugins)
    } catch (error) {
      console.error(error)
    }
  }, [])
  return (
    <div className="w-full h-screen flex bg-gray-800 text-gray-100">
      <div className="w-1/3 border-r border-gray-600 overflow-auto flex flex-col">
        {[
          ["General", "一般設定"],
          ["Mirakurun", "Mirakurun"],
          ["Saya", "Saya"],
        ].map(([key, displayName]) => (
          <button
            key={key}
            type="button"
            className={`focus:outline-none cursor-pointer p-4 border-b border-gray-400 text-left ${
              route === key && "bg-blue-500"
            }`}
            onClick={() => setRoute(key)}
          >
            {displayName}
          </button>
        ))}
        {0 < aditionalRoutes.length && (
          <p className="bg-gray-700 pt-4 pb-2 px-2 text-center text-base w-full border-b border-gray-400">
            プラグイン設定
          </p>
        )}
        {aditionalRoutes.map(([pluginId, name]) => (
          <button
            key={pluginId}
            title={pluginId}
            type="button"
            className={`focus:outline-none cursor-pointer p-4 border-b border-gray-400 text-left ${
              route === pluginId && "bg-blue-500"
            }`}
            onClick={() => setRoute(pluginId)}
          >
            {name}
          </button>
        ))}
        <div className="flex flex-col items-center justify-center space-y-2 pb-4 pt-6">
          <a
            className="text-blue-400 hover:underline text-sm cursor-pointer"
            onClick={() => store.openInEditor()}
          >
            設定ファイルを開く
          </a>
          <a
            className="text-blue-400 hover:underline text-sm cursor-pointer"
            onClick={() =>
              remote.shell.openPath(
                path.join(remote.app.getPath("userData"), "plugins")
              )
            }
          >
            プラグインフォルダを開く
          </a>
        </div>
      </div>

      <Router route={route} />
    </div>
  )
}
