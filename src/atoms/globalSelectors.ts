import { selector } from "recoil"
import pkg from "../../package.json"
import {
  globalActiveContentPlayerIdAtom,
  globalContentPlayerIdsAtom,
} from "./global"

const prefix = `${pkg.name}.global`

export const globalActiveContentPlayerIdSelector = selector<number | null>({
  key: `${prefix}.activeContentPlayerIdSelector`,
  get: ({ get }) => {
    return get(globalActiveContentPlayerIdAtom)
  },
})

export const globalContentPlayerIdsSelector = selector<number[]>({
  key: `${prefix}.globalContentPlayerIdsSelector`,
  get: ({ get }) => {
    return get(globalContentPlayerIdsAtom)
  },
})
