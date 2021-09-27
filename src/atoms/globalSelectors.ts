import { selector } from "recoil"
import pkg from "../../package.json"
import { globalActiveContentPlayerIdAtom } from "./global"

const prefix = `${pkg.name}.global`

export const globalActiveContentPlayerIdSelector = selector<number | null>({
  key: `${prefix}.activeContentPlayerIdSelector`,
  get: ({ get }) => {
    return get(globalActiveContentPlayerIdAtom)
  },
})
