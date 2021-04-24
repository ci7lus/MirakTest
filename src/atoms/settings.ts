import { atom } from "recoil"
import pkg from "../../package.json"
import {
  ExperimentalSetting,
  MirakurunSetting,
  SayaSetting,
  ScreenShotSetting,
} from "../types/struct"

const prefix = `${pkg.name}.settings`

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}.mirakurun`,
  default: {
    baseUrl: undefined,
  },
})

export const sayaSetting = atom<SayaSetting>({
  key: `${prefix}.saya`,
  default: {
    baseUrl: undefined,
    secure: false,
  },
})

export const screenshotSetting = atom<ScreenShotSetting>({
  key: `${prefix}.screenshot`,
  default: {
    saveAsAFile: true,
  },
})

export const experimentalSetting = atom<ExperimentalSetting>({
  key: `${prefix}.experimental`,
  default: {
    isWindowDragMoveEnabled: false,
  },
})
