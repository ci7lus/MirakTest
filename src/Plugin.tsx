import Axios from "axios"
import { ipcRenderer, remote } from "electron"
import React, { useEffect, useState } from "react"
import * as ReactUse from "react-use"
import Recoil from "recoil"
import pkg from "../package.json"
import { StateRoot } from "./State"
import { globalActiveContentPlayerIdAtom } from "./atoms/global"
import { globalContentPlayerPlayingContentFamily } from "./atoms/globalFamilies"
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
  InternalDefineAtom,
} from "./types/plugin"
import { ObjectLiteral } from "./types/struct"
import { nativeImport } from "./utils/nativeImport"
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
      appInfo: { name: pkg.productName, version: pkg.version },
      functions: {
        openWindow,
      },
      atoms: {
        contentPlayerPlayingContentFamily:
          globalContentPlayerPlayingContentFamily,
        activeContentPlayerId: globalActiveContentPlayerIdAtom,
      },
    }
    ;(async () => {
      const atoms: InternalDefineAtom[] = []
      const plugins: PluginDefineInRenderer[] = []
      console.info("pluginPaths:", pluginPaths)
      const openedPlugins: PluginDefineInRenderer[] = []
      for (const filePath of pluginPaths) {
        try {
          console.info("[Plugin] 取り込み中:", filePath)
          const module: { default: InitPlugin } | InitPlugin =
            await nativeImport(filePath)
          const load = "default" in module ? module.default : module
          if (load.renderer) {
            const plugin = await load.renderer(args)
            pluginValidator.parse(plugin)
            console.info(
              `[Plugin] 読込中: ${plugin.name} (${plugin.id}, ${plugin.version})`
            )
            if (
              ![
                ...plugin.storedAtoms,
                ...plugin.sharedAtoms,
                ...plugin.exposedAtoms,
              ].every(
                (atomDef) =>
                  (atomDef.type === "atom" &&
                    atomDef.atom.key.startsWith("plugins.")) ||
                  (atomDef.type === "family" &&
                    atomDef.atom(atomDef.arg).key.startsWith("plugins."))
              )
            ) {
              throw new Error(
                `すべての露出した atom のキーは \`plugins.\` から開始する必要があります: ${plugin.id}`
              )
            }
            openedPlugins.push(plugin)
          }
        } catch (error) {
          console.error("[Plugin] 読み込みエラー:", error)
        }
      }
      for (const plugin of openedPlugins) {
        try {
          await plugin.setup({ plugins: openedPlugins })
          if (plugin.contextMenu) {
            contextMenus[plugin.id] = plugin.contextMenu
          }
          plugin.sharedAtoms
            .map((atomDef) =>
              "key" in atomDef ? atomDef : { ...atomDef, key: atomDef.atom.key }
            )
            .forEach((atom) => {
              const mached = atoms.find((_atom) => _atom.key === atom.key)
              if (!mached) {
                atoms.push(atom)
              }
              setSharedAtoms((atoms) => [...atoms, atom.key])
            })
          plugin.storedAtoms
            .map((atomDef) =>
              "key" in atomDef ? atomDef : { ...atomDef, key: atomDef.atom.key }
            )
            .forEach((atom) => {
              const mached = atoms.find((_atom) => _atom.key === atom.key)
              if (!mached) {
                atoms.push(atom)
              }
              setStoredAtoms((atoms) => [...atoms, atom.key])
            })
          plugin.exposedAtoms
            .map((atomDef) =>
              "key" in atomDef ? atomDef : { ...atomDef, key: atomDef.atom.key }
            )
            .forEach((atom) => {
              const mached = atoms.find((_atom) => _atom.key === atom.key)
              if (!mached) {
                atoms.push(atom)
              }
            })
          plugins.push(plugin)
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
