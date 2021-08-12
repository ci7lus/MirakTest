import { BrowserWindowConstructorOptions } from "electron"

export type OpenWindowArg = {
  name: string
  isSingletone?: boolean
  args?: BrowserWindowConstructorOptions
}

export type RecoilStateUpdateArg = { key: string; value: object }
