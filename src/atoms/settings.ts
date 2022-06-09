import { atom } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import pkg from "../../package.json"
import { SUBTITLE_DEFAULT_FONT } from "../constants/font"
import {
  RECOIL_SYNC_SHARED_KEY,
  RECOIL_SYNC_STORED_KEY,
} from "../constants/recoil"
import type {
  ControllerSetting,
  ExperimentalSetting,
  MirakurunSetting,
  ScreenshotSetting,
  SubtitleSetting,
} from "../types/setting"
import {
  experimentalSettingAtomKey,
  screenshotSettingAtomKey,
} from "./settingsKey"

const prefix = `${pkg.name}.settings`

const mirakurunSettingRefine = $.object({
  isEnableServiceTypeFilter: $.boolean(),
  baseUrl: $.voidable($.string()),
  userAgent: $.voidable($.string()),
})

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}.mirakurun`,
  default: {
    isEnableServiceTypeFilter: true,
  },
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: mirakurunSettingRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: mirakurunSettingRefine,
    }),
  ],
})

export const mirakurunUrlHistory = atom<string[]>({
  key: `${prefix}.mirakurunUrlHistory`,
  default: [],
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: $.array($.string()),
    }),
  ],
})

const controllerSettingRefine = $.object({
  volumeRange: $.withDefault($.array($.number()), [0, 150]),
  isVolumeWheelDisabled: $.withDefault($.boolean(), false),
})

export const controllerSetting = atom<ControllerSetting>({
  key: `${prefix}.controller`,
  default: {
    volumeRange: [0, 150],
    isVolumeWheelDisabled: false,
  },
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: controllerSettingRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: controllerSettingRefine,
    }),
  ],
})

const subtitleSettingRefine = $.object({
  font: $.string(),
})

export const subtitleSetting = atom<SubtitleSetting>({
  key: `${prefix}.subtitle`,
  default: {
    font: SUBTITLE_DEFAULT_FONT,
  },
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: subtitleSettingRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: subtitleSettingRefine,
    }),
  ],
})

const screenshotSettingRefine = $.object({
  saveAsAFile: $.boolean(),
  includeSubtitle: $.boolean(),
  keepQuality: $.boolean(),
  basePath: $.voidable($.string()),
})

export const screenshotSetting = atom<ScreenshotSetting>({
  key: screenshotSettingAtomKey,
  default: {
    saveAsAFile: true,
    includeSubtitle: true,
    keepQuality: true,
  },
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: screenshotSettingRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: screenshotSettingRefine,
    }),
  ],
})

const experimentalSettingRefine = $.object({
  isWindowDragMoveEnabled: $.boolean(),
  isVlcAvCodecHwAny: $.boolean(),
  vlcNetworkCaching: $.number(),
  isDualMonoAutoAdjustEnabled: $.boolean(),
  globalScreenshotAccelerator: $.or($.string(), $.boolean()),
})

export const experimentalSetting = atom<ExperimentalSetting>({
  key: experimentalSettingAtomKey,
  default: {
    isWindowDragMoveEnabled: false,
    isVlcAvCodecHwAny: false,
    vlcNetworkCaching: -1,
    isDualMonoAutoAdjustEnabled: true,
    globalScreenshotAccelerator: false,
  },
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: experimentalSettingRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: experimentalSettingRefine,
    }),
  ],
})
