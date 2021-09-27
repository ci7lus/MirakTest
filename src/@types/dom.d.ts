import { PluginDefineInRenderer, DefineAtom } from "../types/plugin"

export declare global {
  interface Window {
    atoms?: DefineAtom[]
    plugins?: PluginDefineInRenderer[]
    contextMenus?: { [key: string]: Electron.MenuItemConstructorOptions }
  }
}
