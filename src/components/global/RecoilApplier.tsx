import { ipcRenderer } from "electron"
import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { ALL_ATOMS } from "../../atoms"
import { RECOIL_STATE_UPDATE } from "../../constants/ipc"

export const RecoilApplier: React.VFC<{}> = () => {
  const setters = [...ALL_ATOMS, ...(window.atoms || [])].map(
    (atom) => [atom.key, useSetRecoilState(atom)] as const
  )
  useEffect(() => {
    const fn = (
      _ev: Electron.IpcRendererEvent,
      arg: { key: string; value: string }
    ) => {
      const { key, value } = arg
      if (!key) return
      const setter = setters.find(([k]) => k === key)?.[1]
      if (setter) {
        setter(value)
      }
    }
    ipcRenderer.on(RECOIL_STATE_UPDATE, fn)
    return () => {
      ipcRenderer.off(RECOIL_STATE_UPDATE, fn)
    }
  }, [])
  return <></>
}
