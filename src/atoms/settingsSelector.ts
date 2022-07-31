import { selector } from "recoil"
import pkg from "../../package.json"
import {
  controllerSetting,
  experimentalSetting,
  screenshotSetting,
  subtitleSetting,
} from "./settings"

const prefix = `${pkg.name}.settings`

export const controllerSettingSelector = selector({
  key: `${prefix}.controllerSelector`,
  get: ({ get }) => {
    return get(controllerSetting)
  },
})

export const subtitleSettingSelector = selector({
  key: `${prefix}.subtitleSettingSelector`,
  get: ({ get }) => {
    return get(subtitleSetting)
  },
})

export const screenshotSettingSelector = selector({
  key: `${prefix}.screenshotSettingSelector`,
  get: ({ get }) => {
    return get(screenshotSetting)
  },
})

export const experimentalSettingSelector = selector({
  key: `${prefix}.experimentalSettingSelector`,
  get: ({ get }) => {
    return get(experimentalSetting)
  },
})
