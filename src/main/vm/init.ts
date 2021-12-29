import { PluginDefineInMain } from "../../types/plugin"

const esmRequire = esm(module)

globalThis.openedPlugins = new Map()
globalThis.plugins = new Map()

const setupArgment = sandboxArgs
const setAppMenuInternal = sandboxSetMenu

globalThis.setAppMenu = () => {
  setAppMenuInternal(
    Array.from(globalThis.plugins.values())
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
globalThis.showContextMenu = () => {
  sandboxSetContextMenu(
    Array.from(globalThis.plugins.values())
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
globalThis.loadModule = async (filePath, fileName) => {
  const mod = esmRequire(filePath)
  const load = "default" in mod ? mod.default : mod
  if (load.main) {
    const plugin = await load.main(setupArgment)
    console.info(
      `[Plugin] 読込中: ${plugin.name} (${plugin.id}, ${plugin.version})`
    )
    globalThis.openedPlugins.set(fileName, plugin)
  }
}
globalThis.setupPlugin = async (fileName) => {
  const plugin = globalThis.openedPlugins.get(fileName)
  if (!plugin) {
    return
  }
  try {
    await plugin.setup({
      plugins: Array.from(globalThis.openedPlugins.values()),
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
    globalThis.plugins.set(fileName, plugin)
    console.info(
      `[Plugin] ${fileName} を ${plugin.name}(${plugin.id}) として読み込みました`
    )
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
    globalThis.openedPlugins.delete(fileName)
    globalThis.plugins.delete(fileName)
  }
}
globalThis.destroyPlugin = async (fileName) => {
  const instance =
    globalThis.plugins.get(fileName) || globalThis.openedPlugins.get(fileName)
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
    globalThis.plugins.delete(fileName)
    globalThis.openedPlugins.delete(fileName)
    console.info(`[Plugin] ${fileName} を読み込み解除しました`)
  }
}
