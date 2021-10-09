import React, { useEffect, useState } from "react"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil"
import { ComponentShadowWrapper } from "./components/common/ComponentShadowWrapper"
import { Splash } from "./components/global/Splash"
import { ROUTES } from "./constants/routes"
import { Routes } from "./types/struct"
import { CoiledContentPlayer } from "./windows/ContentPlayer"
import { Settings } from "./windows/Settings"

export const Router: React.VFC<{}> = () => {
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE()
  const [hash, setHash] = useState<Routes>("")
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      setHash(hash)
    }
    window.addEventListener("hashchange", onHashChange)
    onHashChange()
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])
  if (hash === ROUTES["ContentPlayer"]) {
    return <CoiledContentPlayer />
  } else if (hash === ROUTES["Settings"]) {
    return <Settings />
  } else if (hash === ROUTES["ProgramTable"]) {
    return <Settings />
  } else {
    const Component = window.plugins?.find((plugin) => plugin.windows?.[hash])
      ?.windows[hash]
    if (Component) {
      return (
        <ComponentShadowWrapper
          _id={hash}
          Component={() => (
            <RecoilBridge>
              <Component />
            </RecoilBridge>
          )}
        />
      )
    }
    return <Splash>Error: 想定していない表示です（{hash}）</Splash>
  }
}
