import { useEffect, useRef } from "react"
import { MutableSnapshot, RecoilState, useRecoilValue } from "recoil"
import { ALL_ATOMS, ALL_FAMILIES } from "../atoms"
import {
  globalFontsAtom,
  globalSharedAtomsAtom,
  globalStoredAtomsAtom,
} from "../atoms/global"
import { AtomFamily } from "../types/plugin"
import { ObjectLiteral } from "../types/struct"

export const initializeState =
  ({
    states,
    storedAtoms,
    sharedAtoms,
    fonts,
  }: {
    states: ObjectLiteral
    storedAtoms: string[]
    sharedAtoms: string[]
    fonts: string[]
  }) =>
  (mutableSnapShot: MutableSnapshot) => {
    mutableSnapShot.set(globalSharedAtomsAtom, sharedAtoms)
    mutableSnapShot.set(globalStoredAtomsAtom, storedAtoms)
    mutableSnapShot.set(globalFontsAtom, fonts)
    storedAtoms.forEach((key) => {
      const savedValue = window.Preload.store.get(key)
      const atom =
        ALL_ATOMS.find((atom) => "key" in atom && atom.key === key) ||
        window.atoms?.find((atom) => "key" in atom && atom.key === key)
      if (savedValue !== undefined && savedValue !== null && atom) {
        mutableSnapShot.set(atom as never, savedValue)
      } else {
        console.warn("[Recoil] ignored in initialize:", key, savedValue)
      }
    })
    Object.entries(states).map(([key, value]) => {
      let arg: unknown
      try {
        arg = JSON.parse(key.split("__").pop() || "")
      } catch (error) {
        arg = null
      }
      const atom =
        ALL_ATOMS.find((atom) => "key" in atom && atom.key === key) ||
        window.atoms?.find((atom) => "key" in atom && atom.key === key) ||
        (arg &&
          ALL_FAMILIES.find((family) => family(arg).key === key)?.(arg)) ||
        window.atoms
          ?.find(
            (atom): atom is AtomFamily =>
              atom.type === "family" && atom.atom(arg).key === key
          )
          ?.atom?.(arg)
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
