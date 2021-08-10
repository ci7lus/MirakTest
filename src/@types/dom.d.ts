import { RecoilState } from "recoil"
import { PluginDefineInRenderer } from "../types/plugin"

export declare global {
  interface Window {
    atoms?: RecoilState<unknown>[]
    plugins?: PluginDefineInRenderer[]
    contextMenus?: { [key: string]: Electron.MenuItemConstructorOptions }
  }
}
