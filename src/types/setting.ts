export type MirakurunSetting = {
  baseUrl?: string
  isEnableWaitForSingleTuner?: boolean
  isEnableServiceTypeFilter?: boolean
  userAgent?: string
}

export type ControllerSetting = {
  volumeRange: [number, number]
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
  isVlcAvCodecHwAny: boolean
  vlcNetworkCaching: number
  isDualMonoAutoAdjustEnabled: boolean
}
