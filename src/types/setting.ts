export type MirakurunSetting = {
  baseUrl?: string
  isEnableServiceTypeFilter?: boolean
  userAgent?: string
}

export type ControllerSetting = {
  volumeRange: readonly [number, number]
  isVolumeWheelDisabled: boolean
}

export type SubtitleSetting = {
  font: string
}

export type ScreenshotSetting = {
  saveAsAFile: boolean
  includeSubtitle: boolean
  basePath?: string
  keepQuality: boolean
}

export type ExperimentalSetting = {
  isWindowDragMoveEnabled: boolean
  mpvHwdec: "videotoolbox" | "auto" | "no"
  mpvCacheSecs: number
  isDualMonoAutoAdjustEnabled: boolean
  isSurroundAutoAdjustEnabeld: boolean
  globalScreenshotAccelerator: string | false
  isCodeBlack: boolean
}
