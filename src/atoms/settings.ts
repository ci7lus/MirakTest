import { atom } from "recoil"
import pkg from "../../package.json"
import type {
  ControllerSetting,
  ExperimentalSetting,
  MirakurunSetting,
  ScreenshotSetting,
} from "../types/setting"

const prefix = `${pkg.name}.settings`

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}.mirakurun`,
  default: {
    isEnableWaitForSingleTuner: false,
    isEnableServiceTypeFilter: true,
  },
})

export const mirakurunUrlHistory = atom<string[]>({
  key: `${prefix}.mirakurunUrlHistory`,
  default: [],
})

export const controllerSetting = atom<ControllerSetting>({
  key: `${prefix}.controller`,
  default: {
    volumeRange: [0, 150],
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
  },
})
