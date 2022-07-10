import React, { useEffect, useState } from "react"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil"
import pkg from "../../package.json"
import { ComponentShadowWrapper } from "../components/common/ComponentShadowWrapper"
import { MirakurunSettingForm } from "../components/settings/Mirakurun"
import { CoiledPluginsSetting } from "../components/settings/Plugins"
import { CoiledGeneralSetting } from "../components/settings/general"
import { OnSettingComponent } from "../types/plugin"

type Routes = "General" | "Mirakurun" | "Plugins" | (string & {})

const Right: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full w-2/3 my-4p-4 text-gray-100 overflow-auto">
    {children}
  </div>
)

const Router: React.FC<{ route: Routes }> = ({ route }) => {
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
  } else if (route === "Plugins") {
    return (
      <Right>
        <CoiledPluginsSetting />
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

export const Settings: React.FC<{}> = () => {
  const [route, setRoute] = useState<Routes>("General")
  const [aditionalRoutes, setAditionalRoutes] = useState<[string, string][]>([])
  useEffect(() => {
    window.Preload.public.setWindowTitle(`設定 - ${pkg.productName}`)
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
          ["Plugins", "プラグイン"],
        ].map(([key, displayName]) => (
          <button
            key={key}
            type="button"
            className={`focus:outline-none p-4 border-b border-gray-400 text-left ${
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
            className={`focus:outline-none p-4 border-b border-gray-400 text-left ${
              route === pluginId && "bg-blue-500"
            }`}
            onClick={() => setRoute(pluginId)}
          >
            {name}
          </button>
        ))}
        <div className="flex flex-col items-center justify-center space-y-2 pb-4 pt-6">
          <a
            className="text-blue-400 hover:underline text-sm"
            onClick={() => {
              window.Preload.store.openConfig()
            }}
          >
            設定ファイルを開く
          </a>
          <a
            className="text-blue-400 hover:underline text-sm"
            onClick={async () => {
              const userData = await window.Preload.public.requestAppPath(
                "userData"
              )
              window.Preload.public.requestShellOpenPath(
                window.Preload.public.joinPath(userData, "plugins")
              )
            }}
          >
            プラグインフォルダを開く
          </a>
        </div>
      </div>

      <Router route={route} />
    </div>
  )
}
