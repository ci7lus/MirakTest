import { atom, selector } from "recoil"
import pkg from "../../package.json"
import type { Program, Service } from "../infra/mirakurun/api"
import type {
  AribSubtitleData,
  ContentPlayerKeyForRestoration,
  ContentPlayerPlayingContent,
} from "../types/contentPlayer"
import { VLCAudioChannel } from "../utils/vlc"

const prefix = `${pkg.name}.contentPlayer`

export const contentPlayerPlayingContent =
  atom<ContentPlayerPlayingContent | null>({
    key: `${prefix}.playingContent`,
    default: null,
  })

export const contentPlayerCurrentProgram = atom<Program | null>({
  key: `${prefix}.currentProgram`,
  default: null,
})

export const contentPlayerSelectedService = atom<Service | null>({
  key: `${prefix}.selectedService`,
  default: null,
})

export const contentPlayerUrl = selector<string | null>({
  key: `${prefix}.url`,
  get: ({ get }) => {
    const content = get(contentPlayerPlayingContent)
    return content?.url || null
  },
})

export const contentPlayerTitle = atom<string | null>({
  key: `${prefix}.title`,
  default: null,
})

export const contentPlayerBounds = atom<Electron.Rectangle | null>({
  key: `${prefix}.bounds`,
  default: null,
})

export const contentPlayerSubtitleEnabled = atom<boolean>({
  key: `${prefix}.subtitleEnabled`,
  default: false,
})

export const contentPlayerIsPlaying = atom<boolean>({
  key: `${prefix}.isPlaying`,
  default: false,
})

export const contentPlayerVolume = atom<number>({
  key: `${prefix}.volume`,
  default: 100,
})

export const contentPlayerAudioChannel = atom<number>({
  key: `${prefix}.audioChannel`,
  default: VLCAudioChannel.Stereo,
})

export const contentPlayerAudioTrack = atom<number>({
  key: `${prefix}.audioTrack`,
  default: 1,
})

export const contentPlayerAudioTracks = atom<string[]>({
  key: `${prefix}.audioTracks`,
  default: [],
})

export const contentPlayerSelectedServiceLogoUrl = atom<string | null>({
  key: `${prefix}.serviceLogoUrl`,
  default: null,
})

export const contentPlayerIsSeekable = atom<boolean>({
  key: `${prefix}.isSeekable`,
  default: false,
})

export const contentPlayerPlayingPosition = atom<number>({
  key: `${prefix}.playingPosition`,
  default: 0,
})

export const contentPlayerPlayingTime = atom<number>({
  key: `${prefix}.playingTime`,
  default: 0,
})

export const contentPlayerAribSubtitleData = atom<AribSubtitleData | null>({
  key: `${prefix}.aribSubtitleData`,
  default: null,
})

export const contentPlayerTsFirstPcr = atom<number>({
  key: `${prefix}.contentPlayerTsFirstPcr`,
  default: 0,
})

export const contentPlayerDisplayingAribSubtitleData = atom<Uint8Array | null>({
  key: `${prefix}.displayngAribSubtitleData`,
  default: null,
})

export const contentPlayerPositionUpdateTrigger = atom<number>({
  key: `${prefix}.positionUpdateTrigger`,
  default: 0,
})

export const contentPlayerRelativeMoveTrigger = atom<number>({
  key: `${prefix}.relativeMoveTrigger`,
  default: 0,
})

export const contentPlayerScreenshotTrigger = atom<number>({
  key: `${prefix}.screenshotTrigger`,
  default: 0,
})

export const contentPlayerKeyForRestoration =
  atom<ContentPlayerKeyForRestoration | null>({
    key: `${prefix}.keyForRestoration`,
    default: null,
  })

export const contentPlayerCommentOpacity = atom<number>({
  key: `${prefix}.commentOpacity`,
  default: 0.8,
})
