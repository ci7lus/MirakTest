import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { RecoilRoot } from "recoil"
import { RecoilObserver } from "./components/global/RecoilObserver"
import { Splash } from "./components/global/Splash"
import { initializeState } from "./utils/recoil"
import { CoiledMainPlayer } from "./windows/MainPlayer"
import { Settings } from "./windows/Settings"

const Router: React.VFC<{}> = () => {
  const hash = window.location.hash as "#MainPlayer" | "#Settings" | "#EPG"
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
  if (unmounted) {
    return <Splash />
  } else if (hash === "#MainPlayer") {
    return <CoiledMainPlayer />
  } else if (hash === "#Settings") {
    return <Settings />
  } else {
    return <Splash>Error: 想定していない表示です（{hash}）</Splash>
  }
}

export const App: React.VFC<{}> = () => {
  return (
    <RecoilRoot initializeState={initializeState}>
      <RecoilObserver />
      <Router />
    </RecoilRoot>
  )
}
