import { BrowserWindowConstructorOptions } from "electron"
import type { SerializableParam } from "recoil"

export type OpenWindowArg = {
  name: string
  isSingletone?: boolean
  args?: BrowserWindowConstructorOptions
}

export type RecoilStateUpdateArg = { key: string; value: SerializableParam }
