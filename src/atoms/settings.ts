import { atom } from "recoil"
import pkg from "../../package.json"
import {
  ExperimentalSetting,
  MirakurunSetting,
  SayaSetting,
  ScreenshotSetting,
} from "../types/struct"

const prefix = `${pkg.name}.settings`

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}.mirakurun`,
  default: {},
})

export const sayaSetting = atom<SayaSetting>({
  key: `${prefix}.saya`,
  default: {
    replaces: [],
  },
})

export const screenshotSetting = atom<ScreenshotSetting>({
  key: `${prefix}.screenshot`,
  default: {
    saveAsAFile: true,
  },
})

export const experimentalSetting = atom<ExperimentalSetting>({
  key: `${prefix}.experimental`,
  default: {
    isWindowDragMoveEnabled: false,
    isProgramDetailInServiceSelectorEnabled: false,
  },
})
