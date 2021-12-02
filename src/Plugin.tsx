import { ipcRenderer, remote } from "electron"
import React, { useEffect, useState } from "react"
import pkg from "../package.json"
import { StateRoot } from "./State"
import {
  contentPlayerAudioChannelAtom,
  contentPlayerAudioTrackAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerScreenshotTriggerAtom,
  contentPlayerVolumeAtom,
} from "./atoms/contentPlayer"
import { contentPlayerPlayingContentAtom } from "./atoms/contentPlayerResolvedFamilies"
import {
  contentPlayerAribSubtitleDataSelector,
  contentPlayerAudioTracksSelector,
  contentPlayerIsSeekableSelector,
  contentPlayerPlayingPositionSelector,
  contentPlayerPlayingTimeSelector,
  contentPlayerProgramSelector,
  contentPlayerScreenshotUrlSelector,
  contentPlayerServiceSelector,
  contentPlayerTotSelector,
  contentPlayerTsFirstPcrSelector,
} from "./atoms/contentPlayerSelectors"
import { globalContentPlayerPlayingContentFamily } from "./atoms/globalFamilies"
import {
  globalActiveContentPlayerIdSelector,
  globalContentPlayerIdsSelector,
} from "./atoms/globalSelectors"
import {
  mirakurunCompatibilitySelector,
  mirakurunServicesSelector,
  mirakurunVersionSelector,
} from "./atoms/mirakurunSelectors"
import { Splash } from "./components/global/Splash"
import { REUQEST_OPEN_WINDOW } from "./constants/ipc"
import {
  RECOIL_SHARED_ATOM_KEYS,
  RECOIL_STORED_ATOM_KEYS,
} from "./constants/recoil"
import { ROUTES } from "./constants/routes"
import {
  OpenBuiltinWindowArg,
  OpenContentPlayerWindowArgs,
  OpenWindowArg,
} from "./types/ipc"
import {
  InitPlugin,
  PluginDefineInRenderer,
  PluginInRendererArgs,
  DefineAtom,
} from "./types/plugin"
import { ObjectLiteral, PluginDatum } from "./types/struct"
import { pluginValidator } from "./utils/plugin"
import { queryPrograms } from "./utils/program"

export const PluginLoader: React.VFC<{
  states: ObjectLiteral
  pluginData: PluginDatum[]
  fonts: string[]
}> = ({ states, pluginData, fonts }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [sharedAtoms, setSharedAtoms] = useState(RECOIL_SHARED_ATOM_KEYS)
  const [storedAtoms, setStoredAtoms] = useState(RECOIL_STORED_ATOM_KEYS)
  useEffect(() => {
    if (isLoading === false) {
      return
    }
    window.plugins = window.atoms = []
    window.contextMenus = {}
    const contextMenus: { [key: string]: Electron.MenuItemConstructorOptions } =
      {}
    const openWindow = async (args: OpenWindowArg) => {
      const isBuiltin = (Object.values(ROUTES) as string[]).includes(args.name)
      if (isBuiltin) {
        throw new Error("ビルトイン画面を開くには専用の関数を用いてください")
      }
      return ipcRenderer.invoke(REUQEST_OPEN_WINDOW, args)
    }
    const openBuiltinWindow = async ({ name }: OpenBuiltinWindowArg) => {
      await ipcRenderer.invoke(REUQEST_OPEN_WINDOW, {
        name,
        isSingletone: true,
      })
    }
    const openContentPlayerWindow = async ({
      playingContent,
      isHideUntilLoaded,
    }: OpenContentPlayerWindowArgs) => {
      return await ipcRenderer.invoke(REUQEST_OPEN_WINDOW, {
        name: ROUTES.ContentPlayer,
        isSingletone: false,
        playingContent,
        isHideUntilLoaded,
      })
    }
    const args: PluginInRendererArgs = {
      packages: {
        Electron: remote,
        IpcRenderer: ipcRenderer,
      },
      appInfo: { name: pkg.productName, version: pkg.version },
      functions: {
        openWindow,
        openBuiltinWindow,
        openContentPlayerWindow,
        queryPrograms,
      },
      hooks: {},
      atoms: {
        globalContentPlayerIdsSelector,
        globalContentPlayerPlayingContentFamily,
        globalActiveContentPlayerIdSelector,
        contentPlayerPlayingContentAtom,
        contentPlayerServiceSelector,
        contentPlayerProgramSelector,
        contentPlayerIsPlayingAtom,
        contentPlayerVolumeAtom,
        contentPlayerAudioChannelAtom,
        contentPlayerAudioTrackAtom,
        contentPlayerAudioTracksSelector,
        contentPlayerIsSeekableSelector,
        contentPlayerPlayingPositionSelector,
        contentPlayerPlayingTimeSelector,
        contentPlayerTotSelector,
        contentPlayerAribSubtitleDataSelector,
        contentPlayerTsFirstPcrSelector,
        contentPlayerPositionUpdateTriggerAtom,
        contentPlayerScreenshotTriggerAtom,
        contentPlayerScreenshotUrlSelector,
        mirakurunCompatibilitySelector,
        mirakurunVersionSelector,
        mirakurunServicesSelector,
      },
    }
    ;(async () => {
      const atoms: DefineAtom[] = []
      const plugins: PluginDefineInRenderer[] = []
      console.info(
        "pluginPaths:",
        pluginData.map((plugin) => plugin.filePath)
      )
      const openedPlugins: PluginDefineInRenderer[] = []
      await Promise.all(
        pluginData.map(async (pluginDatum) => {
          try {
            console.info("[Plugin] 取り込み中:", pluginDatum.fileName)
            const url = URL.createObjectURL(
              new Blob([pluginDatum.content], {
                type: "application/javascript",
              })
            )
            const module: { default: InitPlugin } | InitPlugin = await import(
              /* webpackIgnore: true */ url
            )
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
        })
      )
      await Promise.all(
        openedPlugins.map(async (plugin) => {
          try {
            await plugin.setup({ plugins: openedPlugins })
            if (plugin.contextMenu) {
              contextMenus[plugin.id] = plugin.contextMenu
            }
            plugin.sharedAtoms
              .map((atomDef) =>
                "key" in atomDef
                  ? atomDef
                  : { ...atomDef, key: atomDef.atom.key }
              )
              .forEach((atom) => {
                const mached = atoms.find((_atom) =>
                  _atom.type === "atom"
                    ? _atom.atom.key === atom.key
                    : _atom.key === atom.key
                )
                if (!mached) {
                  atoms.push(atom)
                }
                setSharedAtoms((atoms) => [...atoms, atom.key])
              })
            plugin.storedAtoms
              .map((atomDef) =>
                "key" in atomDef
                  ? atomDef
                  : { ...atomDef, key: atomDef.atom.key }
              )
              .forEach((atom) => {
                const mached = atoms.find((_atom) =>
                  _atom.type === "atom"
                    ? _atom.atom.key === atom.key
                    : _atom.key === atom.key
                )
                if (!mached) {
                  atoms.push(atom)
                }
                setStoredAtoms((atoms) => [...atoms, atom.key])
              })
            plugin.exposedAtoms
              .map((atomDef) =>
                "key" in atomDef
                  ? atomDef
                  : { ...atomDef, key: atomDef.atom.key }
              )
              .forEach((atom) => {
                const mached = atoms.find((_atom) =>
                  _atom.type === "atom"
                    ? _atom.atom.key === atom.key
                    : _atom.key === atom.key
                )
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
        })
      )
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
      fonts={fonts}
    />
  )
}
