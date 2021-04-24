import React, { useState } from "react"
import { CoiledGeneralSetting } from "../components/settings/general"
import { MirakurunSettingForm } from "../components/settings/Mirakurun"
import { SayaSettingForm } from "../components/settings/Saya"
import { store } from "../utils/store"

type Routes = "General" | "Mirakurun" | "Saya"

const Router: React.VFC<{ route: Routes }> = ({ route }) => {
  if (route === "General") {
    return <CoiledGeneralSetting />
  } else if (route === "Mirakurun") {
    return <MirakurunSettingForm />
  } else if (route === "Saya") {
    return <SayaSettingForm />
  } else {
    return <>その設定項目はありません</>
  }
}

export const Settings: React.VFC<{}> = () => {
  const [route, setRoute] = useState<Routes>("General")
  return (
    <div
      className="w-full h-full flex bg-gray-800 text-gray-100"
      style={{ height: "80vh" }}
    >
      <div className="w-1/3 border-r border-gray-600 py-4 overflow-auto flex flex-col">
        <button
          type="button"
          className={`focus:outline-none p-4 border-b border-gray-400 text-left ${
            route === "General" && "bg-blue-500"
          }`}
          onClick={() => setRoute("General")}
        >
          一般設定
        </button>
        <button
          type="button"
          className={`focus:outline-none p-4 border-b border-gray-400 text-left ${
            route === "Mirakurun" && "bg-blue-500"
          }`}
          onClick={() => setRoute("Mirakurun")}
        >
          Mirakurun
        </button>
        <button
          type="button"
          className={`focus:outline-none p-4 border-b border-gray-400 text-left ${
            route === "Saya" && "bg-blue-500"
          }`}
          onClick={() => setRoute("Saya")}
        >
          Saya
        </button>
        <div className="flex items-center justify-center">
          <a
            className="text-blue-400 hover:underline text-sm py-4"
            onClick={() => store.openInEditor()}
          >
            設定ファイルを開く
          </a>
        </div>
      </div>
      <div className="h-full w-2/3 my-4p-4 text-gray-100 overflow-auto">
        <Router route={route} />
      </div>
    </div>
  )
}
