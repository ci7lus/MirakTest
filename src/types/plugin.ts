import Axios from "axios"
import { remote } from "electron"
import React from "react"
import * as Recoil from "recoil"
import { ContentPlayerPlayingContent } from "./contentPlayer"
import { OpenWindowArg } from "./ipc"

export type AppInfo = {
  version: string
}

export type CustomComponent = {
  id: string
  component: React.VFC<{}>
}

export type OnSplashComponent = { position: "onSplash" } & CustomComponent // ほぼ見えない。バックグラウンド実行用などに

export type OnSettingComponent = {
  position: "onSetting"
  label: string
} & CustomComponent // 設定画面

export type OnPlayerComponent = { position: "onPlayer" } & CustomComponent // プレイヤーの上、字幕より後ろ

export type OnSubtitleComponent = { position: "onSubtitle" } & CustomComponent // 字幕より上、コントローラーより後ろ

export type OnForwardComponent = { position: "onForward" } & CustomComponent // 一番前、pointer-events: noneのため触りたい場合は該当部分だけautoにしておくこと

export type ComponentWithPosition =
  | OnSplashComponent
  | OnSettingComponent
  | OnPlayerComponent
  | OnSubtitleComponent
  | OnForwardComponent

export type InitPlugin = {
  main?: InitPluginInMain
  renderer?: InitPluginInRenderer
}

export type PluginInRendererArgs = {
  appInfo: AppInfo
  packages: {
    React: typeof React
    Recoil: typeof Recoil
    Electron: typeof remote
    Axios: typeof Axios
    IpcRenderer: Electron.IpcRenderer
  }
  functions: {
    openWindow: (args: OpenWindowArg) => Promise<number>
  }
}

export type InitPluginInRenderer = (
  args: PluginInRendererArgs
) => PluginDefineInRenderer | Promise<PluginDefineInRenderer>

export type PluginInMainArgs = {
  appInfo: AppInfo
  packages: {
    Electron: {
      app: Electron.App
      ipcMain: Electron.IpcMain
      browserWindow: typeof Electron.BrowserWindow
      dialog: Electron.Dialog
    }
  }
  functions: {
    openWindow: (args: OpenWindowArg) => Electron.BrowserWindow
  }
}

export type InitPluginInMain = (
  args: PluginInMainArgs
) => PluginDefineInMain | Promise<PluginDefineInMain>

export type PluginMeta = {
  // 推奨 id フォーマット: `plugins.${authorNamespace}.${pluginNamespace}` or `io.github.c..`(java 形式)
  id: string
  name: string
  version: string
  author: string
  authorUrl?: string
  description: string
  url?: string
  destroy: () => void | Promise<void> // 現時点で正しく実行される保証はない、セットアップが正常に終了していなくても呼ばれる点に注意
}

export type PluginDefineInRenderer = PluginMeta & {
  setup: ({
    plugins,
  }: {
    plugins: PluginDefineInRenderer[]
  }) => void | Promise<void>
  // 重要: atom の key は `plugins.${authorNamespace}.${pluginNamespace}.` から開始、大きくルールに反する atom （`plugins.`から開始しない）を露出したプラグインはロードされない
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exposedAtoms: Recoil.RecoilState<any>[] // 他のプラグインと連携するとか
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedAtoms: Recoil.RecoilState<any>[] // ウィンドウ間で共有する（シリアライズ可能にすること）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storedAtoms: Recoil.RecoilState<any>[] // 保存する（シリアライズ可能にすること）
  // コンポーネントとウィンドウは shadowRoot に展開されるので、各自独自に CSS をバンドルしないとスタイリングが初期化される点に注意する
  components: ComponentWithPosition[]
  windows: {
    [key: string]: React.VFC<{}> // カスタム画面、hash を key に
  }
  contextMenu?: Electron.MenuItemConstructorOptions
  _experimental_feature__service?: {
    // テレビサービス（構想中）
    contentType: string
    restoreByKey: (
      arg: unknown
    ) => ContentPlayerPlayingContent | Promise<ContentPlayerPlayingContent>
  }
}

export type PluginDefineInMain = PluginMeta & {
  setup: ({
    plugins,
  }: {
    plugins: PluginDefineInMain[]
  }) => void | Promise<void>
  appMenu?: Electron.MenuItemConstructorOptions
}
