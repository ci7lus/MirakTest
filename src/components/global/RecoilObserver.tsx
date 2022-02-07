import React from "react"
import { useRecoilTransactionObserver_UNSTABLE, useRecoilValue } from "recoil"
import type { SerializableParam } from "recoil"
import {
  globalSharedAtomsAtom,
  globalStoredAtomsAtom,
} from "../../atoms/global"

export const RecoilObserver: React.VFC<{}> = () => {
  const sharedAtoms = useRecoilValue(globalSharedAtomsAtom)
  const storedAtoms = useRecoilValue(globalStoredAtomsAtom)
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (const atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      const key = atom.key.split("__").shift()
      if (!key) throw new Error("key error: " + atom.key)
      if (sharedAtoms.includes(key)) {
        const value = snapshot.getLoadable(atom).getValue() as SerializableParam
        window.Preload.recoilStateUpdate({
          key: atom.key,
          value,
        })
      }
      if (storedAtoms.includes(atom.key)) {
        try {
          const value = snapshot.getLoadable(atom).getValue()
          window.Preload.store.set(atom.key, value)
        } catch (error) {
          console.error(error)
        }
      }
    }
  })
  return <></>
}
