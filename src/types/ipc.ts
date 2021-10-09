import { BrowserWindowConstructorOptions } from "electron"
import type { SerializableParam } from "recoil"
import { ROUTES } from "../constants/routes"
import { ContentPlayerPlayingContent } from "./contentPlayer"

export type OpenWindowArg = {
  name: string
  isSingletone?: boolean
  args?: BrowserWindowConstructorOptions
  playingContent?: ContentPlayerPlayingContent
  isHideUntilLoaded?: boolean
}

export type OpenBuiltinWindowArg = {
  name: Omit<keyof typeof ROUTES, typeof ROUTES["ContentPlayer"]>
}

export type OpenContentPlayerWindowArgs = {
  playingContent?: ContentPlayerPlayingContent
  isHideUntilLoaded?: boolean
}

export type RecoilStateUpdateArg = { key: string; value: SerializableParam }
