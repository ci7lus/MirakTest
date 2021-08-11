import { ipcRenderer } from "electron"
import React from "react"
import { useRecoilTransactionObserver_UNSTABLE, useRecoilValue } from "recoil"
import {
  globalSharedAtomsAtom,
  globalStoredAtomsAtom,
} from "../../atoms/global"
import { RECOIL_STATE_UPDATE } from "../../constants/ipc"
import { store } from "../../utils/store"

export const RecoilObserver: React.VFC<{}> = () => {
  const sharedAtoms = useRecoilValue(globalSharedAtomsAtom)
  const storedAtoms = useRecoilValue(globalStoredAtomsAtom)
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (const atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      if (sharedAtoms.includes(atom.key)) {
        const value = snapshot.getLoadable(atom).getValue()
        ipcRenderer.send(RECOIL_STATE_UPDATE, {
          key: atom.key,
          value,
        })
      }
      if (storedAtoms.includes(atom.key)) {
        try {
          const value = snapshot.getLoadable(atom).getValue()
          store.set(atom.key, value)
        } catch (error) {
          console.error(error)
        }
      }
    }
  })
  return <></>
}
