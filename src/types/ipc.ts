import { BrowserWindowConstructorOptions } from "electron"

export type OpenWindowArg = {
  name: string
  isSingletone?: boolean
  args?: BrowserWindowConstructorOptions
}
