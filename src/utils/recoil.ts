import { useEffect, useRef } from "react"
import { MutableSnapshot, RecoilState, useRecoilValue } from "recoil"
import { ALL_ATOMS } from "../atoms"
import { globalSharedAtoms, globalStoredAtoms } from "../atoms/global"
import { ObjectLiteral } from "../types/struct"
import { store } from "./store"

export const initializeState =
  ({
    states,
    storedAtoms,
    sharedAtoms,
  }: {
    states: ObjectLiteral
    storedAtoms: string[]
    sharedAtoms: string[]
  }) =>
  (mutableSnapShot: MutableSnapshot) => {
    mutableSnapShot.set(globalSharedAtoms, sharedAtoms)
    mutableSnapShot.set(globalStoredAtoms, storedAtoms)
    storedAtoms.forEach((key) => {
      const savedValue = store.get(key, null)
      const atom = ALL_ATOMS.find((atom) => "key" in atom && atom.key === key)
      if (savedValue !== null && atom) {
        mutableSnapShot.set(atom as never, savedValue)
      } else {
        console.warn("[Recoil] ignored in initialize:", key)
      }
    })
    Object.entries(states).map(([key, value]) => {
      const atom = ALL_ATOMS.find((atom) => "key" in atom && atom.key === key)
      if (atom) {
        mutableSnapShot.set(atom as never, value)
      } else {
        console.warn("[Recoil] ignored in initialize:", key)
      }
    })
  }

export const useRecoilValueRef = <T>(s: RecoilState<T>) => {
  const value = useRecoilValue(s)
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return [value, ref] as const
}
