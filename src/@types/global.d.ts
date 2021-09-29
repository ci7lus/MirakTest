import _Recoil from "recoil"
import { PluginDefineInRenderer, DefineAtom } from "../types/plugin"

declare global {
  interface Window {
    atoms?: DefineAtom[]
    plugins?: PluginDefineInRenderer[]
    contextMenus?: { [key: string]: Electron.MenuItemConstructorOptions }
  }

  // eslint-disable-next-line no-var
  declare var Recoil: typeof _Recoil
}
