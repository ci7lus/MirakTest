import React from "react"
import { RecoilRoot } from "recoil"
import { RecoilObserver } from "./components/global/RecoilObserver"
import { Splash } from "./components/global/Splash"
import { initializeState } from "./utils/recoil"
import { CoiledMainPlayer } from "./windows/MainPlayer"
import { Settings } from "./windows/Settings"

const Router: React.VFC<{}> = () => {
  const hash = window.location.hash as "#MainPlayer" | "#Settings" | "#EPG"
  if (hash === "#MainPlayer") {
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
