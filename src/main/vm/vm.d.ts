/* eslint-disable no-var */
import {
  InitPlugin,
  PluginDefineInMain,
  PluginInMainArgs,
} from "../../types/plugin"

declare global {
  declare var setAppMenu: () => void
  declare var showContextMenu: () => void
  declare var showContextMenu: () => void
  declare var setupModule: (
    fileName: string,
    mod: { default: InitPlugin } | InitPlugin,
    setupArgment: PluginInMainArgs
  ) => Promise<void>
  declare var setupPlugin: (fileName: string) => Promise<void>
  declare var destroyPlugin: (fileName: string) => Promise<void>

  declare var openedPlugins: Map<string, PluginDefineInMain>
  declare var plugins: Map<string, PluginDefineInMain>
}
