import { ipcRenderer } from "electron"
import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { PluginLoader } from "./Plugin"
import { Splash } from "./components/global/Splash"
import { REQUEST_INITIAL_DATA } from "./constants/ipc"
import { InitialData } from "./types/struct"
import "./index.scss"

const WebRoot: React.VFC<{}> = () => {
  const [unmounted, setUnmounted] = useState(false)
  useEffect(() => {
    const app = document.getElementById("app")
    if (!app) return
    const beforeUnload = () => {
      setUnmounted(true)
      ReactDOM.unmountComponentAtNode(app)
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [])
  const [initialData, setInitialData] = useState<InitialData | null>(null)
  useEffect(() => {
    ipcRenderer
      .invoke(REQUEST_INITIAL_DATA)
      .then((data) => setInitialData(data))
  }, [])
  if (unmounted || initialData === null) {
    return <Splash />
  }
  return <PluginLoader {...initialData} />
}

ReactDOM.render(<WebRoot />, document.getElementById("app"))
