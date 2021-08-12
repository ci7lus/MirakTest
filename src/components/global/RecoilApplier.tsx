import { ipcRenderer } from "electron"
import React, { useEffect, useState } from "react"
import { useSetRecoilState, SetterOrUpdater } from "recoil"
import { ALL_ATOMS, ALL_FAMILIES } from "../../atoms"
import { RECOIL_STATE_UPDATE } from "../../constants/ipc"
import { RecoilStateUpdateArg } from "../../types/ipc"
import { Atom, AtomFamily } from "../../types/plugin"

const AtomSetter: React.VFC<{
  payload: RecoilStateUpdateArg
}> = ({ payload }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let setter: SetterOrUpdater<any>
  if (payload) {
    if (payload.key.includes("__")) {
      const [, ...splited] = payload.key.split("__")
      const args = JSON.parse(splited.join("__"))
      const atom = [
        ...ALL_FAMILIES.map((atom) => atom(args)),
        ...(
          window.atoms?.filter(
            (atomDef): atomDef is AtomFamily => atomDef.type === "family"
          ) || []
        ).map(({ atom }) => atom(args)),
      ].find((atom) => atom.key === payload.key)
      if (atom) {
        setter = useSetRecoilState(atom)
      }
    } else {
      const atom = [
        ...ALL_ATOMS,
        ...((
          (window.atoms?.filter((atomDef) => atomDef.type === "atom") ||
            []) as Atom[]
        ).map(({ atom }) => atom) || []),
      ].find((atom) => atom.key === payload.key)
      if (atom) {
        setter = useSetRecoilState(atom)
      }
    }
  }

  useEffect(() => {
    if (payload && setter !== undefined) {
      payload && setter && setter(payload.value)
    } else {
      console.warn("対象の atom が見つかりません", payload)
    }
  }, [payload])
  return <></>
}

export const RecoilApplier: React.VFC<{}> = () => {
  const [payload, setPayload] = useState<RecoilStateUpdateArg | null>(null)
  useEffect(() => {
    const fn = (
      _ev: Electron.IpcRendererEvent,
      payload: RecoilStateUpdateArg
    ) => {
      if (!payload.key) return
      const { key, value } = payload
      setPayload({ key, value })
    }
    ipcRenderer.on(RECOIL_STATE_UPDATE, fn)
    return () => {
      ipcRenderer.off(RECOIL_STATE_UPDATE, fn)
    }
  }, [])
  if (payload) {
    return <AtomSetter payload={payload} />
  }
  return <></>
}
