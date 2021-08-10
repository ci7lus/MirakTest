import Axios from "axios"
import { ipcRenderer, remote } from "electron"
import React, { useEffect, useState } from "react"
import * as ReactUse from "react-use"
import Recoil, { RecoilState } from "recoil"
import pkg from "../package.json"
import { StateRoot } from "./State"
import { Splash } from "./components/global/Splash"
import { REUQEST_OPEN_WINDOW } from "./constants/ipc"
import {
  RECOIL_SHARED_ATOM_KEYS,
  RECOIL_STORED_ATOM_KEYS,
} from "./constants/recoil"
import { OpenWindowArg } from "./types/ipc"
import {
  InitPlugin,
  PluginDefineInRenderer,
  PluginInRendererArgs,
} from "./types/plugin"
import { ObjectLiteral } from "./types/struct"
import { pluginValidator } from "./utils/plugin"

export const PluginLoader: React.VFC<{
  states: ObjectLiteral
  pluginPaths: string[]
}> = ({ states, pluginPaths }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [sharedAtoms, setSharedAtoms] = useState(RECOIL_SHARED_ATOM_KEYS)
  const [storedAtoms, setStoredAtoms] = useState(RECOIL_STORED_ATOM_KEYS)
  useEffect(() => {
    window.plugins = window.atoms = []
    window.contextMenus = {}
    const contextMenus: { [key: string]: Electron.MenuItemConstructorOptions } =
      {}
    const openWindow = async (args: OpenWindowArg) => {
      return await ipcRenderer.invoke(REUQEST_OPEN_WINDOW, args)
    }
    const args: PluginInRendererArgs = {
      packages: {
        React,
        Recoil,
        Axios,
        Electron: remote,
        IpcRenderer: ipcRenderer,
        ReactUse,
      },
      appInfo: { version: pkg.version },
      functions: {
        openWindow,
      },
    }
    ;(async () => {
      const atoms: RecoilState<unknown>[] = []
      const plugins: PluginDefineInRenderer[] = []
      console.info("pluginPaths:", pluginPaths)
      const openedPlugins: PluginDefineInRenderer[] = []
      for (const filePath of pluginPaths) {
        const iframe = document.createElement("iframe")
        iframe.style.display = "none"
        document.body.appendChild(iframe)
        try {
          if (filePath.includes("`")) {
            throw new Error(`[Plugin] 不適な文字列を含んでいます: ${filePath}`)
          }
          console.info(
            "[Plugin] 取り込み中:",
            filePath,
            `import(\`${filePath}\`)`
          )
          if (!iframe.contentWindow) throw new Error("iframe.contentWindow")
          const module = await iframe.contentWindow.eval<
            Promise<{ default: InitPlugin } | InitPlugin>
          >(`import(\`${filePath}\`)`)
          const load = "default" in module ? module.default : module
          if (load.renderer) {
            const plugin = await load.renderer(args)
            pluginValidator.parse(plugin)
            console.info(
              `[Plugin] 読込中: ${plugin.name} (${plugin.id}, ${plugin.version})`
            )
            iframe.id = plugin.id + ".iframe"
            if (
              ![
                ...plugin.storedAtoms,
                ...plugin.sharedAtoms,
                ...plugin.exposedAtoms,
              ].every((atom) => atom.key.startsWith("plugins."))
            ) {
              throw new Error(
                `すべての露出した atom のキーは \`plugins.\` から開始する必要があります: ${plugin.id}`
              )
            }
            openedPlugins.push(plugin)
          } else {
            document.body.removeChild(iframe)
          }
        } catch (error) {
          console.error("[Plugin] 読み込みエラー:", error)
          document.body.removeChild(iframe)
        }
      }
      for (const plugin of openedPlugins) {
        try {
          await plugin.setup({ plugins: openedPlugins })
          if (plugin.contextMenu) {
            contextMenus[plugin.id] = plugin.contextMenu
          }
          plugin.sharedAtoms.forEach((atom) => {
            const mached = atoms.find((_atom) => _atom.key === atom.key)
            if (!mached) {
              atoms.push(atom)
            }
            setSharedAtoms((atoms) => [...atoms, atom.key])
          })
          plugin.storedAtoms.forEach((atom) => {
            const mached = atoms.find((_atom) => _atom.key === atom.key)
            if (!mached) {
              atoms.push(atom)
            }
            setStoredAtoms((atoms) => [...atoms, atom.key])
          })
          plugin.exposedAtoms.forEach((atom) => {
            const mached = atoms.find((_atom) => _atom.key === atom.key)
            if (!mached) {
              atoms.push(atom)
            }
          })
          plugins.push(plugin)
          console.info("[Plugin] 読み込み完了:", plugin.id)
        } catch (error) {
          console.error(
            "[Plugin] setup 中にエラーが発生しました:",
            plugin.id,
            error
          )
          try {
            await plugin.destroy()
          } catch (error) {
            console.error(
              "[Plugin] destroy 中にエラーが発生しました:",
              plugin.id,
              error
            )
          }
        }
      }
      window.plugins = plugins
      window.atoms = atoms
      window.contextMenus = contextMenus
      setIsLoading(false)
    })()
  }, [])
  if (isLoading) {
    return <Splash />
  }
  return (
    <StateRoot
      states={states}
      sharedAtoms={sharedAtoms}
      storedAtoms={storedAtoms}
    />
  )
}
