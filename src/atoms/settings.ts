import { atom } from "recoil"
import pkg from "../../package.json"
import type {
  ControllerSetting,
  ExperimentalSetting,
  MirakurunSetting,
  SayaSetting,
  ScreenshotSetting,
} from "../types/setting"

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

export const controllerSetting = atom<ControllerSetting>({
  key: `${prefix}.controller`,
  default: {
    volumeRange: [0, 150],
    isEnableWaitForSingleTuner: true,
  },
})

export const screenshotSetting = atom<ScreenshotSetting>({
  key: `${prefix}.screenshot`,
  default: {
    saveAsAFile: true,
    includeSubtitle: true,
  },
})

export const experimentalSetting = atom<ExperimentalSetting>({
  key: `${prefix}.experimental`,
  default: {
    isWindowDragMoveEnabled: false,
    isProgramDetailInServiceSelectorEnabled: false,
    isRichPresenceEnabled: false,
  },
})
