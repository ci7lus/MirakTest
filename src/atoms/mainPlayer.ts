import { atom } from "recoil"
import pkg from "../../package.json"
import { Program, Service } from "../infra/mirakurun/api"
import { MainPlayerRoute } from "../types/struct"

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

export const mainPlayerUrl = atom<string | null>({
  key: `${prefix}.url`,
  default: null,
})

export const mainPlayerVolume = atom<number>({
  key: `${prefix}.volume`,
  default: 100,
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

export const mainPlayerRoute = atom<MainPlayerRoute>({
  key: `${prefix}.route`,
  default: null,
})

export const mainPlayerCommentOpacity = atom<number>({
  key: `${prefix}.commentOpacity`,
  default: 0.8,
})
