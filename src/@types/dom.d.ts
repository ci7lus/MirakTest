import { PluginDefineInRenderer, InternalDefineAtom } from "../types/plugin"

export declare global {
  interface Window {
    atoms?: InternalDefineAtom[]
    plugins?: PluginDefineInRenderer[]
    contextMenus?: { [key: string]: Electron.MenuItemConstructorOptions }
  }
}
