import { useEffect, useRef } from "react"
import { useRecoilValue } from "recoil"
import type { MutableSnapshot, RecoilState } from "recoil"
import { globalFontsAtom } from "../atoms/global"
import { ObjectLiteral } from "../types/struct"

export const initializeState =
  ({ fonts }: { states: ObjectLiteral; fonts: string[] }) =>
  (mutableSnapShot: MutableSnapshot) => {
    mutableSnapShot.set(globalFontsAtom, fonts)
  }

export const useRecoilValueRef = <T>(s: RecoilState<T>) => {
  const value = useRecoilValue(s)
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return [value, ref] as const
}
