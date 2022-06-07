import type { BrowserWindowConstructorOptions } from "electron"
import type { SerializableParam } from "recoil"
import { ROUTES } from "../constants/routes"
import { Program } from "../infra/mirakurun/api"
import { QuerySchema } from "../main/epgManager"
import { ContentPlayerPlayingContent } from "./contentPlayer"
import { InitialData } from "./struct"

export type OpenWindowArg = {
  name: string
  isSingletone?: boolean
  args?: BrowserWindowConstructorOptions
  playingContent?: ContentPlayerPlayingContent
}

export type OpenBuiltinWindowArg = {
  name: Omit<keyof typeof ROUTES, typeof ROUTES["ContentPlayer"]>
}

export type OpenContentPlayerWindowArgs = {
  playingContent?: ContentPlayerPlayingContent
  isHideUntilLoaded?: boolean
}

export type SerializableKV = { key: string; value: SerializableParam }

export type EPGManagerRegisterArg = { url: string; userAgent?: string }

export type Preload = {
  webchimera: {
    setup: (args: string[]) => void
    isOk: () => boolean
    onTimeChanged: (listener: (time: number) => void) => void
    onLogMessage: (listener: (level: string, message: string) => void) => void
    onFrameReady: (
      listener: (
        frame: Uint8Array,
        width: number,
        height: number,
        uOffset: number,
        vOffset: number
      ) => void
    ) => void
    onMediaChanged: (listener: () => void) => void
    onEncounteredError: (listener: () => void) => void
    onStopped: (listener: () => void) => void
    onEndReached: (listener: () => void) => void
    onPaused: (listener: () => void) => void
    onPlaying: (listener: () => void) => void
    onSeekableChanged: (listener: (isSeekable: boolean) => void) => void
    onPositionChanged: (listener: (position: number) => void) => void
    destroy: () => void
    setVolume: (volume: number) => void
    play: (url: string) => void
    togglePause: () => void
    stop: () => void
    hasVout: () => boolean
    isPlaying: () => boolean
    getSubtitleTrack: () => number
    setSubtitleTrack: (track: number) => void
    getAudioChannel: () => number
    setAudioChannel: (channel: number) => void
    setAudioTrack: (track: number) => void
    setPosition: (position: number) => void
    getAudioTracks: () => string[]
    setSpeed: (speed: number) => void
  }
  requestInitialData: () => Promise<InitialData>
  recoilStateUpdate: (_: SerializableKV) => Promise<void>
  onRecoilStateUpdate: (listener: (arg: SerializableKV) => void) => () => void
  updateIsPlayingState: (isPlaying: boolean) => Promise<void>
  store: {
    set: <T = unknown>(key: string, value: T) => void
    get: <T = unknown>(key: string) => T
    delete: (key: string) => void
    openConfig: () => void
  }
  onUpdateIsPlayingState: (listener: (isPlaying: boolean) => void) => () => void
  onWindowMoved: (listener: () => void) => () => void
  onScreenshotRequest: (listener: () => void) => () => void
  requestScreenshotBasePath: () => Promise<string>
  updateGlobalScreenshotAccelerator: (a: string | false) => Promise<boolean>
  public: {
    setWindowAspect: (aspect: number) => void
    isDirectoryExists: (path: string) => Promise<boolean>
    writeFile: (_: { path: string; buffer: ArrayBuffer }) => Promise<boolean>
    writeArrayBufferToClipboard: (buffer: ArrayBuffer) => void
    requestDialog: (
      arg: Electron.OpenDialogOptions
    ) => Promise<Electron.OpenDialogReturnValue>
    requestConfirmDialog: (
      message: string,
      buttons: string[]
    ) => Promise<Electron.MessageBoxReturnValue>
    requestShellOpenPath: (path: string) => void
    toggleAlwaysOnTop: () => void
    requestAppPath: (name: string) => Promise<string>
    requestCursorScreenPoint: () => Promise<Electron.Rectangle>
    toggleFullScreen: () => void
    exitFullScreen: () => void
    showNotification: (
      arg: Electron.NotificationConstructorOptions,
      path?: string
    ) => void
    showWindow: () => void
    setWindowTitle: (title: string) => void
    setWindowPosition: (x: number, y: number) => void
    requestWindowContentBounds: () => Promise<Electron.Rectangle | undefined>
    setWindowContentBounds: (rect: Partial<Electron.Rectangle>) => void
    requestOpenWindow: (_: OpenWindowArg) => Promise<number>
    epgManager: {
      register: (_: EPGManagerRegisterArg) => Promise<void>
      unregister: (url: string) => Promise<void>
      query: (arg: QuerySchema) => Promise<Program[]>
    }
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}
