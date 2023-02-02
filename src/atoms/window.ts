import { atom } from "recoil"
import pkg from "../../package.json"

const prefix = `${pkg.name}.window`

export const windowRootFontSizeAtom = atom<number>({
  key: `${prefix}.rootFontSize`,
  default: 16,
})
