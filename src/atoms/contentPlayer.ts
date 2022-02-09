import { atom } from "recoil"
import pkg from "../../package.json"
import type {
  AribSubtitleData,
  ContentPlayerKeyForRestoration,
} from "../types/contentPlayer"
import { VLCAudioChannel } from "../utils/vlc"

const prefix = `${pkg.name}.contentPlayer`

export const contentPlayerTitleAtom = atom<string | null>({
  key: `${prefix}.title`,
  default: null,
})

export const contentPlayerBoundsAtom = atom<Electron.Rectangle | null>({
  key: `${prefix}.bounds`,
  default: null,
})

export const contentPlayerSubtitleEnabledAtom = atom<boolean>({
  key: `${prefix}.subtitleEnabled`,
  default: false,
})

export const contentPlayerIsPlayingAtom = atom<boolean>({
  key: `${prefix}.isPlaying`,
  default: false,
})

export const contentPlayerVolumeAtom = atom<number>({
  key: `${prefix}.volume`,
  default: 100,
})

export const contentPlayerSpeedAtom = atom<number>({
  key: `${prefix}.speed`,
  default: 1,
})

export const contentPlayerAudioChannelAtom = atom<number>({
  key: `${prefix}.audioChannel`,
  default: VLCAudioChannel.Stereo,
})

export const contentPlayerAudioTrackAtom = atom<number>({
  key: `${prefix}.audioTrack`,
  default: 1,
})

export const contentPlayerAudioTracksAtom = atom<string[]>({
  key: `${prefix}.audioTracks`,
  default: [],
})

export const contentPlayerIsSeekableAtom = atom<boolean>({
  key: `${prefix}.isSeekable`,
  default: false,
})

export const contentPlayerPlayingPositionAtom = atom<number>({
  key: `${prefix}.playingPosition`,
  default: 0,
})

export const contentPlayerPlayingTimeAtom = atom<number>({
  key: `${prefix}.playingTime`,
  default: 0,
})

export const contentPlayerTotAtom = atom<number>({
  key: `${prefix}.tot`,
  default: 0,
})

export const contentPlayerAribSubtitleDataAtom = atom<AribSubtitleData | null>({
  key: `${prefix}.aribSubtitleData`,
  default: null,
})

export const contentPlayerTsFirstPcrAtom = atom<number>({
  key: `${prefix}.tsFirstPcr`,
  default: 0,
})

export const contentPlayerDisplayingAribSubtitleDataAtom =
  atom<Uint8Array | null>({
    key: `${prefix}.displayngAribSubtitleData`,
    default: null,
  })

export const contentPlayerPositionUpdateTriggerAtom = atom<number>({
  key: `${prefix}.positionUpdateTrigger`,
  default: 0,
})

export const contentPlayerScreenshotTriggerAtom = atom<number>({
  key: `${prefix}.screenshotTrigger`,
  default: 0,
})

export const contentPlayerScreenshotUrlAtom = atom<string | null>({
  key: `${prefix}.screenshotUrl`,
  default: null,
})

export const contentPlayerKeyForRestorationAtom =
  atom<ContentPlayerKeyForRestoration | null>({
    key: `${prefix}.keyForRestoration`,
    default: null,
  })

export const lastEpgUpdatedAtom = atom<number>({
  key: `${prefix}.lastEpgUpdated`,
  default: 0,
})
