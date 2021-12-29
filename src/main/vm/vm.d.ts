/* eslint-disable no-var */
import {
  InitPlugin,
  PluginDefineInMain,
  PluginInMainArgs,
} from "../../types/plugin"

declare global {
  declare const esm: (
    n: NodeModule
  ) => (s: string) => { default: InitPlugin } | InitPlugin
  declare const sandboxArgs: PluginInMainArgs
  declare const sandboxSetMenu: (
    m: Electron.MenuItemConstructorOptions[]
  ) => void
  declare const sandboxSetContextMenu: (
    m: Electron.MenuItemConstructorOptions[]
  ) => void

  declare var setAppMenu: () => void
  declare var showContextMenu: () => void
  declare var showContextMenu: () => void
  declare var loadModule: (filePath: string, fileName: string) => void
  declare var setupPlugin: (fileName: string) => Promise<void>
  declare var destroyPlugin: (fileName: string) => Promise<void>

  declare var openedPlugins: Map<string, PluginDefineInMain>
  declare var plugins: Map<string, PluginDefineInMain>
}
