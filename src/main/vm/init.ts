/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  InitPlugin,
  PluginDefineInMain,
  PluginInMainArgs,
} from "../../types/plugin"

const openedPlugins = new Map()
const plugins = new Map()

const setAppMenu = (
  sandboxSetMenu: (m: Electron.MenuItemConstructorOptions[]) => void
) => {
  sandboxSetMenu(
    Array.from(plugins.values())
      .filter(
        (
          plugin
        ): plugin is PluginDefineInMain & {
          appMenu: Electron.MenuItemConstructorOptions
        } => !!plugin.appMenu
      )
      .map((plugin) => plugin.appMenu)
  )
}
const showContextMenu = (
  sandboxSetContextMenu: (m: Electron.MenuItemConstructorOptions[]) => void
) => {
  sandboxSetContextMenu(
    Array.from(plugins.values())
      .filter(
        (
          plugin
        ): plugin is PluginDefineInMain & {
          contextMenu: Electron.MenuItemConstructorOptions
        } => !!plugin.contextMenu
      )
      .map((plugin) => plugin.contextMenu)
  )
}
const setupModule = async (
  fileName: string,
  mod: { default: InitPlugin } | InitPlugin,
  setupArgment: PluginInMainArgs
) => {
  const load = "default" in mod ? mod.default : mod
  if (load.main) {
    const plugin = await load.main(setupArgment)
    console.info(
      `[Plugin] 読込中: ${plugin.name} (${plugin.id}, ${plugin.version})`
    )
    openedPlugins.set(fileName, plugin)
  }
}
const setupPlugin = async (fileName: string) => {
  const plugin = openedPlugins.get(fileName)
  if (!plugin) {
    return
  }
  try {
    await plugin.setup({
      plugins: Array.from(openedPlugins.values()),
    })
    if (plugin.appMenu) {
      console.info(
        `[Plugin] ${plugin.name}(${plugin.id}) にはアプリメニューが存在します`
      )
    }
    if (plugin.contextMenu) {
      console.info(
        `[Plugin] ${plugin.name}(${plugin.id}) コンテキストメニューを読み込みました`
      )
    }
    plugins.set(fileName, plugin)
    console.info(
      `[Plugin] ${fileName} を ${plugin.name}(${plugin.id}) として読み込みました`
    )
    return `${plugin.name} (${plugin.id}, ${fileName})`
  } catch (error) {
    console.error("[Plugin] setup 中にエラーが発生しました:", plugin.id, error)
    try {
      await plugin.destroy()
    } catch (error) {
      console.error(
        "[Plugin] destroy 中にエラーが発生しました:",
        plugin.id,
        error
      )
    }
    openedPlugins.delete(fileName)
    plugins.delete(fileName)
  }
}
const destroyPlugin = async (fileName: string) => {
  const instance = plugins.get(fileName) || openedPlugins.get(fileName)
  if (instance) {
    try {
      await instance.destroy()
    } catch (error) {
      console.error(
        "[Plugin] destroy 中にエラーが発生しました:",
        instance.id,
        error
      )
    }
    plugins.delete(fileName)
    openedPlugins.delete(fileName)
    console.info(`[Plugin] ${fileName} を読み込み解除しました`)
  }
}
const getPluginDisplay = (fileName: string) => {
  const instance = plugins.get(fileName) || openedPlugins.get(fileName)
  if (!instance) {
    return fileName
  }
  return `${instance.name} (${instance.id}, ${fileName})`
}
