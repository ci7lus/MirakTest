import { selector } from "recoil"
import pkg from "../../package.json"
import { contentPlayerPlayingContentAtom } from "./contentPlayer"

const prefix = `${pkg.name}.contentPlayer`

export const contentPlayerUrlSelector = selector<string | null>({
  key: `${prefix}.url`,
  get: ({ get }) => {
    const content = get(contentPlayerPlayingContentAtom)
    return content?.url || null
  },
})
