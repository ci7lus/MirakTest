import React from "react"
import { RecoilRoot } from "recoil"
import { Router } from "./Router"
import { PluginPositionComponents } from "./components/common/PluginPositionComponents"
import { RecoilApplier } from "./components/global/RecoilApplier"
import { RecoilObserver } from "./components/global/RecoilObserver"
import { ObjectLiteral } from "./types/struct"
import { initializeState } from "./utils/recoil"

export const StateRoot: React.VFC<{
  states: ObjectLiteral
  sharedAtoms: string[]
  storedAtoms: string[]
  fonts: string[]
}> = ({ states, sharedAtoms, storedAtoms, fonts }) => {
  return (
    <RecoilRoot
      initializeState={initializeState({
        states,
        sharedAtoms,
        storedAtoms,
        fonts,
      })}
    >
      <RecoilObserver />
      <RecoilApplier />
      <div className="w-full h-full relative">
        <div
          id="OnBackgroundComponents"
          className="absolute top-0 left-0 w-full h-full pointer-events-none hidden"
        >
          <PluginPositionComponents position="onBackground" />
        </div>
        <Router />
      </div>
    </RecoilRoot>
  )
}
