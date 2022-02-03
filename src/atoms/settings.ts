import { atom } from "recoil"
import pkg from "../../package.json"
import { SUBTITLE_DEFAULT_FONT } from "../constants/font"
import type {
  ControllerSetting,
  ExperimentalSetting,
  MirakurunSetting,
  ScreenshotSetting,
  SubtitleSetting,
} from "../types/setting"
import { screenshotSettingAtomKey } from "./settingsKey"

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

export const subtitleSetting = atom<SubtitleSetting>({
  key: `${prefix}.subtitle`,
  default: {
    font: SUBTITLE_DEFAULT_FONT,
  },
})

export const screenshotSetting = atom<ScreenshotSetting>({
  key: screenshotSettingAtomKey,
  default: {
    saveAsAFile: true,
    includeSubtitle: true,
  },
})

export const experimentalSetting = atom<ExperimentalSetting>({
  key: `${prefix}.experimental`,
  default: {
    isWindowDragMoveEnabled: false,
    isVlcAvCodecHwAny: false,
    vlcNetworkCaching: -1,
  },
})
