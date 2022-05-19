import _Recoil from "recoil"
import { Preload } from "../types/ipc"
import { InternalPluginDefineInRenderer, DefineAtom } from "../types/plugin"
import { PluginDatum } from "../types/struct"

declare global {
  interface Window {
    atoms?: DefineAtom[]
    pluginData?: PluginDatum[]
    disabledPluginFileNames?: string[]
    plugins?: InternalPluginDefineInRenderer[]
    Preload: Preload
    id?: number
  }

  // eslint-disable-next-line no-var
  declare var Recoil: typeof _Recoil

  declare const structuredClone: <T>(obj: T) => T
}
