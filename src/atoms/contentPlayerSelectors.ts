import { selector } from "recoil"
import pkg from "../../package.json"
import { Program, Service } from "../infra/mirakurun/api"
import {
  contentPlayerAudioTracksAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPlayingPositionAtom,
  contentPlayerPlayingTimeAtom,
} from "./contentPlayer"
import { contentPlayerPlayingContentAtom } from "./contentPlayerResolvedFamilies"

const prefix = `${pkg.name}.contentPlayer`

export const contentPlayerAudioTracksSelector = selector<string[]>({
  key: `${prefix}.audioTracksSelector`,
  get: ({ get }) => {
    return get(contentPlayerAudioTracksAtom)
  },
})

export const contentPlayerIsSeekableSelector = selector<boolean>({
  key: `${prefix}.isSeekableSelector`,
  get: ({ get }) => {
    return get(contentPlayerIsSeekableAtom)
  },
})

export const contentPlayerPlayingPositionSelector = selector<number>({
  key: `${prefix}.playingPositionSelector`,
  get: ({ get }) => {
    return get(contentPlayerPlayingPositionAtom)
  },
})

export const contentPlayerPlayingTimeSelector = selector<number>({
  key: `${prefix}.playingTimeSelector`,
  get: ({ get }) => {
    return get(contentPlayerPlayingTimeAtom)
  },
})

export const contentPlayerAribSubtitleDataSelector = selector<number>({
  key: `${prefix}.aribSubtitleDataSelector`,
  get: ({ get }) => {
    return get(contentPlayerPlayingTimeAtom)
  },
})

export const contentPlayerTsFirstPcrSelector = selector<number>({
  key: `${prefix}.tsFirstPcrSelector`,
  get: ({ get }) => {
    return get(contentPlayerPlayingTimeAtom)
  },
})

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
