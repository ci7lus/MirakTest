import React, { useEffect, useState } from "react"
import pkg from "../package.json"
import { StateRoot } from "./State"
import {
  contentPlayerAudioChannelAtom,
  contentPlayerAudioTrackAtom,
  contentPlayerPositionUpdateTriggerAtom,
  contentPlayerScreenshotTriggerAtom,
  contentPlayerSpeedAtom,
  contentPlayerVolumeAtom,
} from "./atoms/contentPlayer"
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
import {
  globalContentPlayerIsPlayingFamily,
  globalContentPlayerPlayingContentFamily,
  globalContentPlayerSelectedServiceFamily,
} from "./atoms/globalFamilies"
import {
  globalActiveContentPlayerIdSelector,
  globalContentPlayerIdsSelector,
} from "./atoms/globalSelectors"
import {
  mirakurunCompatibilitySelector,
  mirakurunServicesSelector,
  mirakurunVersionSelector,
} from "./atoms/mirakurunSelectors"
import {
  controllerSettingSelector,
  experimentalSettingSelector,
  screenshotSettingSelector,
  subtitleSettingSelector,
} from "./atoms/settingsSelector"
import { Splash } from "./components/global/Splash"
import {
  RECOIL_SYNC_SHARED_KEY,
  RECOIL_SYNC_STORED_KEY,
} from "./constants/recoil"
import { ROUTES } from "./constants/routes"
import {
  OpenBuiltinWindowArg,
  OpenContentPlayerWindowArgs,
  OpenWindowArg,
} from "./types/ipc"
import {
  InitPlugin,
  PluginInRendererArgs,
  DefineAtom,
  InternalPluginDefineInRenderer,
} from "./types/plugin"
import { ObjectLiteral, PluginDatum } from "./types/struct"
import { pluginValidator } from "./utils/plugin"

export const PluginLoader: React.FC<{
  states: ObjectLiteral
  pluginData: PluginDatum[]
  fonts: string[]
  disabledPluginFileNames: string[]
}> = ({ states, pluginData, fonts, disabledPluginFileNames }) => {
  const contentPlayerIsPlayingAtom = globalContentPlayerIsPlayingFamily(
    window.id ?? 0
  )

  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (isLoading === false) {
      return
    }
    window.plugins = window.atoms = []
    const openWindow = (args: OpenWindowArg) => {
      const isBuiltin = (Object.values(ROUTES) as string[]).includes(args.name)
      if (isBuiltin) {
        throw new Error("ビルトイン画面を開くには専用の関数を用いてください")
      }
      return window.Preload.public.requestOpenWindow(args)
    }
    const openBuiltinWindow = async ({ name }: OpenBuiltinWindowArg) => {
      await window.Preload.public.requestOpenWindow({
        name: name as string,
        isSingletone: true,
      })
    }
    const openContentPlayerWindow = async ({
      playingContent,
      isHideUntilLoaded,
    }: OpenContentPlayerWindowArgs) => {
      return await window.Preload.public.requestOpenWindow({
        name: ROUTES.ContentPlayer,
        isSingletone: false,
        playingContent,
        args: { show: isHideUntilLoaded === true },
      })
    }
    const args: PluginInRendererArgs = {
      rpc: window.Preload.public,
      windowId: window.id ?? -1,
      appInfo: { name: pkg.productName, version: pkg.version },
      functions: {
        openWindow,
        openBuiltinWindow,
        openContentPlayerWindow,
      },
      hooks: {},
      atoms: {
        globalContentPlayerIdsSelector,
        globalContentPlayerPlayingContentFamily,
        globalActiveContentPlayerIdSelector,
        globalContentPlayerSelectedServiceFamily,
        globalContentPlayerIsPlayingFamily,
        contentPlayerPlayingContentAtom:
          globalContentPlayerPlayingContentFamily(window.id ?? -1),
        contentPlayerServiceSelector,
        contentPlayerProgramSelector,
        contentPlayerIsPlayingAtom,
        contentPlayerVolumeAtom,
        contentPlayerSpeedAtom,
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
        controllerSettingSelector,
        subtitleSettingSelector,
        screenshotSettingSelector,
        experimentalSettingSelector,
      },
      constants: {
        recoil: {
          storedKey: RECOIL_SYNC_STORED_KEY,
          sharedKey: RECOIL_SYNC_SHARED_KEY,
        },
      },
    }
    window.pluginData = pluginData
    window.disabledPluginFileNames = disabledPluginFileNames
    ;(async () => {
      const atoms: DefineAtom[] = []
      const plugins: InternalPluginDefineInRenderer[] = []
      console.info(
        "pluginPaths:",
        pluginData.map((plugin) => plugin.filePath)
      )
      const openedPlugins: InternalPluginDefineInRenderer[] = []
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
                !plugin.exposedAtoms.every(
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
              openedPlugins.push({ ...plugin, fileName: pluginDatum.fileName })
            }
          } catch (error) {
            console.error(
              "[Plugin] 読み込みエラー:",
              pluginDatum.filePath,
              error
            )
          }
        })
      )
      await Promise.all(
        openedPlugins
          .filter(
            (plugin) => !disabledPluginFileNames.includes(plugin.fileName)
          )
          .map(async (plugin) => {
            console.info(
              `[Plugin] セットアップ中: ${plugin.name} (${plugin.id}, ${plugin.version})`
            )
            try {
              await plugin.setup({ plugins: openedPlugins })
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
      setIsLoading(false)
    })()
  }, [])
  if (isLoading) {
    return <Splash />
  }
  return <StateRoot states={states} fonts={fonts} />
}
