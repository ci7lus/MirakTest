import refine from "@recoiljs/refine"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import Recoil from "recoil"
import RecoilSync from "recoil-sync"
import { PluginLoader } from "./Plugin"
import { Splash } from "./components/global/Splash"
import { InitialData } from "./types/struct"
import "./index.scss"

global.React = React
global.Recoil = Recoil
const compatibilityRecoilSync = { ...RecoilSync, refine }
global.RecoilSync = compatibilityRecoilSync

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require("@welldone-software/why-did-you-render")
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("app")!)

const WebRoot: React.FC<{}> = () => {
  const [unmounted, setUnmounted] = useState(false)
  useEffect(() => {
    const app = document.getElementById("app")
    if (!app) return
    const beforeUnload = () => {
      setUnmounted(true)
      root.unmount()
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [])
  const [initialData, setInitialData] = useState<InitialData | null>(null)
  useEffect(() => {
    window.Preload.requestInitialData().then((data) => {
      window.id = data.windowId
      setInitialData(data)
    })
  }, [])
  if (unmounted || initialData === null) {
    return <Splash />
  }
  return <PluginLoader {...initialData} />
}

root.render(<WebRoot />)
