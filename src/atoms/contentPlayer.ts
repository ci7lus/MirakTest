import { atom } from "recoil"
import pkg from "../../package.json"
import type { Program, Service } from "../infra/mirakurun/api"
import type { ContentPlayerRoute } from "../types/contentPlayer"
import { VLCAudioChannel } from "../utils/vlc"

const prefix = `${pkg.name}.contentPlayer`

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

export const contentPlayerUrl = atom<string | null>({
  key: `${prefix}.url`,
  default: null,
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

export const contentPlayerCurrentProgram = atom<Program | null>({
  key: `${prefix}.currentProgram`,
  default: null,
})

export const contentPlayerSelectedService = atom<Service | null>({
  key: `${prefix}.selectedService`,
  default: null,
})

export const contentPlayerLastSelectedServiceId = atom<number | null>({
  key: `${prefix}.lastSelectedServiceId`,
  default: null,
})

export const contentPlayerSelectedServiceLogoUrl = atom<string | null>({
  key: `${prefix}.selectedServiceLogoUrl`,
  default: null,
})

export const contentPlayerPlayingTime = atom<number>({
  key: `${prefix}.playingTime`,
  default: 0,
})

export const contentPlayerPlayingPosition = atom<number>({
  key: `${prefix}.playingPosition`,
  default: 0,
})

export const contentPlayerIsSeekable = atom<boolean>({
  key: `${prefix}.isSeekable`,
  default: false,
})

export const contentPlayerPositionUpdateTrigger = atom<number>({
  key: `${prefix}.positionUpdateTrigger`,
  default: 0,
})

export const contentPlayerAribSubtitleData = atom<{
  data: string
  pts: number
} | null>({
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

export const contentPlayerScreenshotTrigger = atom<number>({
  key: `${prefix}.screenshotTrigger`,
  default: 0,
})

export const contentPlayerRoute = atom<ContentPlayerRoute>({
  key: `${prefix}.route`,
  default: null,
})

export const contentPlayerCommentOpacity = atom<number>({
  key: `${prefix}.commentOpacity`,
  default: 0.8,
})
