import React from "react"
import { RecoilRoot } from "recoil"
import { Router } from "./Router"
import { RecoilApplier } from "./components/global/RecoilApplier"
import { RecoilObserver } from "./components/global/RecoilObserver"
import { ObjectLiteral } from "./types/struct"
import { initializeState } from "./utils/recoil"

export const StateRoot: React.VFC<{
  states: ObjectLiteral
  sharedAtoms: string[]
  storedAtoms: string[]
}> = ({ states, sharedAtoms, storedAtoms }) => {
  return (
    <RecoilRoot
      initializeState={initializeState({ states, sharedAtoms, storedAtoms })}
    >
      <RecoilObserver />
      <RecoilApplier />
      <Router />
    </RecoilRoot>
  )
}
