import React, { useEffect, useState } from "react"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil"
import { ComponentShadowWrapper } from "./components/common/ComponentShadowWrapper"
import { Splash } from "./components/global/Splash"
import { ROUTES } from "./constants/routes"
import { Routes } from "./types/struct"
import { CoiledContentPlayer } from "./windows/ContentPlayer"
import { CoiledProgramTable } from "./windows/ProgramTable"
import { Settings } from "./windows/Settings"

export const Router: React.FC<{}> = () => {
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE()
  const [hash, setHash] = useState<Routes>("")
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      setHash(hash)
    }
    window.addEventListener("hashchange", onHashChange)
    onHashChange()
    window.Preload.public.showWindow()
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])
  useEffect(() => {
    const root = document.querySelector<HTMLHtmlElement>(":root")
    if (!root) {
      return
    }
    let timer: NodeJS.Timeout | null = null
    const onResize = () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        // clamp(14px, 1.25vw, 100%);
        // max(14px, min(1.25vw, 16px))
        root.style.fontSize =
          Math.max(14, Math.min((window.innerWidth / 100) * 1.25, 16)) + "px"
        timer = null
      }, 50)
    }
    window.addEventListener("resize", onResize)
    onResize()
    return () => window.removeEventListener("resize", onResize)
  }, [])
  if (hash === ROUTES["ContentPlayer"]) {
    return <CoiledContentPlayer />
  } else if (hash === ROUTES["Settings"]) {
    return <Settings />
  } else if (hash === ROUTES["ProgramTable"]) {
    return <CoiledProgramTable />
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
