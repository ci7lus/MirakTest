import { selector } from "recoil"
import pkg from "../../package.json"
import { Program, Service } from "../infra/mirakurun/api"
import { contentPlayerPlayingContentAtom } from "./contentPlayerResolvedFamilies"

const prefix = `${pkg.name}.contentPlayer`

export const contentPlayerUrlSelector = selector<string | null>({
  key: `${prefix}.url`,
  get: ({ get }) => {
    const content = get(contentPlayerPlayingContentAtom)
    return content?.url || null
  },
})

export const contentPlayerServiceSelector = selector<Service | null>({
  key: `${prefix}.service`,
  get: ({ get }) => {
    const content = get(contentPlayerPlayingContentAtom)
    return content?.service || null
  },
})

export const contentPlayerProgramSelector = selector<Program | null>({
  key: `${prefix}.program`,
  get: ({ get }) => {
    const content = get(contentPlayerPlayingContentAtom)
    return content?.program || null
  },
})
