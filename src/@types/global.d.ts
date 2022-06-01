import _Recoil from "recoil"
import _RecoilSync from "recoil-sync"
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
  // eslint-disable-next-line no-var
  declare var RecoilSync: typeof _RecoilSync

  declare function structuredClone<T>(
    obj: T,
    options?: StructuredSerializeOptions
  ): T
}
