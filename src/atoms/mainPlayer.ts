import { atom } from "recoil"
import pkg from "../../package.json"
import { Program, Service } from "../infra/mirakurun/api"
import { MainPlayerRoute } from "../types/mainPlayer"
import { VLCAudioChannel } from "../utils/vlc"

const prefix = `${pkg.name}.mainPlayer`

export const mainPlayerTitle = atom<string | null>({
  key: `${prefix}.title`,
  default: null,
})

export const mainPlayerBounds = atom<Electron.Rectangle | null>({
  key: `${prefix}.bounds`,
  default: null,
})

export const mainPlayerSubtitleEnabled = atom<boolean>({
  key: `${prefix}.subtitleEnabled`,
  default: false,
})

export const mainPlayerIsPlaying = atom<boolean>({
  key: `${prefix}.isPlaying`,
  default: false,
})

export const mainPlayerUrl = atom<string | null>({
  key: `${prefix}.url`,
  default: null,
})

export const mainPlayerVolume = atom<number>({
  key: `${prefix}.volume`,
  default: 100,
})

export const mainPlayerAudioChannel = atom<number>({
  key: `${prefix}.audioChannel`,
  default: VLCAudioChannel.Stereo,
})

export const mainPlayerAudioTrack = atom<number>({
  key: `${prefix}.audioTrack`,
  default: 1,
})

export const mainPlayerAudioTracks = atom<string[]>({
  key: `${prefix}.audioTracks`,
  default: [],
})

export const mainPlayerCurrentProgram = atom<Program | null>({
  key: `${prefix}.currentProgram`,
  default: null,
})

export const mainPlayerSelectedService = atom<Service | null>({
  key: `${prefix}.selectedService`,
  default: null,
})

export const mainPlayerLastSelectedServiceId = atom<number | null>({
  key: `${prefix}.lastSelectedServiceId`,
  default: null,
})

export const mainPlayerPlayingTime = atom<number>({
  key: `${prefix}.playingTime`,
  default: 0,
})

export const mainPlayerAribSubtitleData = atom<{
  data: string
  pts: number
} | null>({
  key: `${prefix}.aribSubtitleData`,
  default: null,
})

export const mainPlayerTsFirstPcr = atom<number>({
  key: `${prefix}.mainPlayerTsFirstPcr`,
  default: 0,
})

export const mainPlayerDisplayingAribSubtitleData = atom<Uint8Array | null>({
  key: `${prefix}.displayngAribSubtitleData`,
  default: null,
})

export const mainPlayerScreenshotTrigger = atom<number>({
  key: `${prefix}.screenshotTrigger`,
  default: 0,
})

export const mainPlayerRoute = atom<MainPlayerRoute>({
  key: `${prefix}.route`,
  default: null,
})

export const mainPlayerCommentOpacity = atom<number>({
  key: `${prefix}.commentOpacity`,
  default: 0.8,
})
