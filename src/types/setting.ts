export type MirakurunSetting = {
  username?: string
  password?: string
  baseUrl?: string
}

export type SayaSetting = {
  baseUrl?: string
  replaces: [string, string][]
}

export type ControllerSetting = {
  volumeRange: [number, number]
  isEnableWaitForSingleTuner: boolean
}

export type ScreenshotSetting = {
  saveAsAFile: boolean
  includeSubtitle: boolean
  basePath?: string
}

export type ExperimentalSetting = {
  isWindowDragMoveEnabled: boolean
  isProgramDetailInServiceSelectorEnabled: boolean
  isRichPresenceEnabled: boolean
}
