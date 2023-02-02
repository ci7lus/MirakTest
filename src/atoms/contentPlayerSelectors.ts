import { selector } from "recoil"
import pkg from "../../package.json"
import { Program } from "../infra/mirakurun/api"
import { ServiceWithLogoData } from "../types/mirakurun"
import {
  contentPlayerAudioTracksAtom,
  contentPlayerIsSeekableAtom,
  contentPlayerPlayingPositionAtom,
  contentPlayerPlayingTimeAtom,
  contentPlayerScreenshotUrlAtom,
  contentPlayerTotAtom,
} from "./contentPlayer"
import { globalContentPlayerPlayingContentFamily } from "./globalFamilies"

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

export const contentPlayerTotSelector = selector<number>({
  key: `${prefix}.totSelector`,
  get: ({ get }) => {
    return get(contentPlayerTotAtom)
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
    const content = get(
      globalContentPlayerPlayingContentFamily(window.id ?? -1)
    )
    return content?.url || null
  },
})

export const contentPlayerServiceSelector =
  selector<ServiceWithLogoData | null>({
    key: `${prefix}.service`,
    get: ({ get }) => {
      const content = get(
        globalContentPlayerPlayingContentFamily(window.id ?? -1)
      )
      return content?.service || null
    },
  })

export const contentPlayerProgramSelector = selector<Program | null>({
  key: `${prefix}.program`,
  get: ({ get }) => {
    const content = get(
      globalContentPlayerPlayingContentFamily(window.id ?? -1)
    )
    return content?.program || null
  },
})

export const contentPlayerScreenshotUrlSelector = selector<string | null>({
  key: `${prefix}.screenshotUrlSelector`,
  get: ({ get }) => {
    return get(contentPlayerScreenshotUrlAtom)
  },
})
