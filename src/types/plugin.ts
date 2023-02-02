import type { EventEmitter } from "events"
import React from "react"
import * as Recoil from "recoil"
import { Program, Service } from "../infra/mirakurun/api"
export type { Channel, Service, Program } from "../infra/mirakurun/api"
import { ContentPlayerPlayingContent } from "./contentPlayer"
import {
  OpenBuiltinWindowArg,
  OpenContentPlayerWindowArgs,
  OpenWindowArg,
  Preload,
} from "./ipc"
import { MirakurunCompatibilityTypes } from "./mirakurun"
import {
  ControllerSetting,
  ExperimentalSetting,
  ScreenshotSetting,
  SubtitleSetting,
} from "./setting"
export type { ContentPlayerPlayingContent } from "./contentPlayer"

export type AppInfo = {
  name: string
  version: string
}

export type CustomComponent = {
  id: string
  component: React.FC<{}>
}

/** すべてのウィンドウに展開される。見えない。 */
export type OnBackgroundComponent = {
  position: "onBackground"
} & CustomComponent

/** ほぼ見えない。バックグラウンド実行用などに */
export type OnSplashComponent = { position: "onSplash" } & CustomComponent

/** プラグイン設定画面 */
export type OnSettingComponent = {
  position: "onSetting"
  label: string
} & CustomComponent

/** コントローラーのポップアップに出る。小さなコンポーネントにすること */
export type OnControllerPopupComponent = {
  position: "OnControllerPopup"
} & CustomComponent

/** プレイヤーの上、字幕より後ろ */
export type OnPlayerComponent = { position: "onPlayer" } & CustomComponent

/** 字幕より上、コントローラーより後ろ */
export type OnSubtitleComponent = { position: "onSubtitle" } & CustomComponent

/** 一番前、pointer-events: noneのため触りたい場合は該当部分だけautoにしておくこと */
export type OnForwardComponent = { position: "onForward" } & CustomComponent

export type ComponentWithPosition =
  | OnBackgroundComponent
  | OnSplashComponent
  | OnSettingComponent
  | OnControllerPopupComponent
  | OnPlayerComponent
  | OnSubtitleComponent
  | OnForwardComponent

export type InitPlugin = {
  main?: InitPluginInMain
  renderer?: InitPluginInRenderer
}

export type PluginInRendererArgs = {
  appInfo: AppInfo
  rpc: Preload["public"]
  windowId: number
  functions: {
    openWindow: (args: OpenWindowArg) => Promise<number>
    openBuiltinWindow: (args: OpenBuiltinWindowArg) => Promise<void>
    openContentPlayerWindow: (
      args: OpenContentPlayerWindowArgs
    ) => Promise<number>
  }
  hooks: {}
  atoms: {
    globalContentPlayerIdsSelector: Recoil.RecoilValueReadOnly<number[]>
    globalContentPlayerPlayingContentFamily: (
      n: number
    ) => Recoil.RecoilState<ContentPlayerPlayingContent | null>
    globalActiveContentPlayerIdSelector: Recoil.RecoilValueReadOnly<
      number | null
    >
    globalContentPlayerSelectedServiceFamily: (
      n: number
    ) => Recoil.RecoilState<Service | null>
    globalContentPlayerIsPlayingFamily: (
      n: number
    ) => Recoil.RecoilState<boolean>
    contentPlayerPlayingContentAtom: Recoil.RecoilState<ContentPlayerPlayingContent | null>
    contentPlayerServiceSelector: Recoil.RecoilValueReadOnly<Service | null>
    contentPlayerProgramSelector: Recoil.RecoilValueReadOnly<Program | null>
    contentPlayerIsPlayingAtom: Recoil.RecoilState<boolean>
    contentPlayerVolumeAtom: Recoil.RecoilState<number>
    contentPlayerSpeedAtom: Recoil.RecoilState<number>
    contentPlayerAudioChannelAtom: Recoil.RecoilState<number>
    contentPlayerAudioTrackAtom: Recoil.RecoilState<number>
    contentPlayerAudioTracksSelector: Recoil.RecoilValueReadOnly<string[]>
    contentPlayerIsSeekableSelector: Recoil.RecoilValueReadOnly<boolean>
    contentPlayerPlayingPositionSelector: Recoil.RecoilValueReadOnly<number>
    contentPlayerPlayingTimeSelector: Recoil.RecoilValueReadOnly<number>
    contentPlayerTotSelector: Recoil.RecoilValueReadOnly<number>
    contentPlayerAribSubtitleDataSelector: Recoil.RecoilValueReadOnly<number>
    contentPlayerTsFirstPcrSelector: Recoil.RecoilValueReadOnly<number>
    contentPlayerPositionUpdateTriggerAtom: Recoil.RecoilState<number>
    contentPlayerScreenshotTriggerAtom: Recoil.RecoilState<number>
    contentPlayerScreenshotUrlSelector: Recoil.RecoilValueReadOnly<
      string | null
    >
    mirakurunCompatibilitySelector: Recoil.RecoilValueReadOnly<MirakurunCompatibilityTypes | null>
    mirakurunVersionSelector: Recoil.RecoilValueReadOnly<string | null>
    mirakurunServicesSelector: Recoil.RecoilValueReadOnly<Service[] | null>
    controllerSettingSelector: Recoil.RecoilValueReadOnly<ControllerSetting>
    subtitleSettingSelector: Recoil.RecoilValueReadOnly<SubtitleSetting>
    screenshotSettingSelector: Recoil.RecoilValueReadOnly<ScreenshotSetting>
    experimentalSettingSelector: Recoil.RecoilValueReadOnly<ExperimentalSetting>
  }
  constants: {
    recoil: {
      sharedKey: string
      storedKey: string
    }
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
      browserWindow: typeof Electron.BrowserWindow
      dialog: Electron.Dialog
      ipcMain: Electron.IpcMain
      session: typeof Electron.Session
    }
    events: {
      eventEmitter: EventEmitter
    }
  }
  functions: {
    openWindow: (args: OpenWindowArg) => Electron.BrowserWindow
    openBuiltinWindow: (args: OpenBuiltinWindowArg) => void
    openContentPlayerWindow: (args: OpenContentPlayerWindowArgs) => void
  }
}

export type InitPluginInMain = (
  args: PluginInMainArgs
) => PluginDefineInMain | Promise<PluginDefineInMain>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Atom<T = any> = {
  type: "atom"
  atom: Recoil.RecoilState<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomFamily<A = any, T = any> = {
  type: "family"
  atom: (arg: A) => Recoil.RecoilState<T>
  key: string
  arg: A
}

export type DefineAtom = Atom | AtomFamily

export type PluginMeta = {
  /** 推奨 id フォーマット: `plugins.${authorNamespace}.${pluginNamespace}` or `io.github.c..`(java 形式) */
  id: string
  name: string
  version: string
  author: string
  authorUrl?: string
  description: string
  url?: string
  /** 現時点で正しく実行される保証はない、セットアップが正常に終了していなくても呼ばれる点に注意 */
  destroy: () => void | Promise<void>
}

export type PluginDefineInRenderer = PluginMeta & {
  setup: ({
    plugins,
  }: {
    plugins: PluginDefineInRenderer[]
  }) => void | Promise<void>
  /** 他のプラグインと連携するとか
   * 重要: atom の key は `plugins.${authorNamespace}.${pluginNamespace}.` から開始、大きくルールに反する atom （`plugins.`から開始しない）を露出したプラグインはロードされない */
  exposedAtoms: DefineAtom[]
  /** ウィンドウ間で共有する Atom（シリアライズ可能にすること）
   * @deprecated 後方互換性のためのフィールドです、同時に Atom に syncEffect も設定してください */
  sharedAtoms?: DefineAtom[]
  /** 保存する Atom（シリアライズ可能にすること）。
   * @deprecated 後方互換性のためのフィールドです、同時に Atom に syncEffect も設定してください */
  storedAtoms?: DefineAtom[]
  /** コンポーネントとウィンドウは shadowRoot に展開されるので、各自独自に CSS をバンドルしないとスタイリングが初期化される点に注意する */
  components: ComponentWithPosition[]
  windows: {
    /** カスタム画面、hash を key に */
    [key: string]: React.FC<{}>
  }
  _experimental_feature__service?: {
    /** テレビサービス（構想中） */
    contentType: string
    restoreByKey: (
      arg: unknown
    ) =>
      | ContentPlayerPlayingContent
      | null
      | Promise<ContentPlayerPlayingContent | null>
  }
}

export type InternalPluginDefineInRenderer = PluginDefineInRenderer & {
  fileName: string
}

export type PluginDefineInMain = PluginMeta & {
  setup: ({
    plugins,
  }: {
    plugins: PluginDefineInMain[]
  }) => void | Promise<void>
  appMenu?: Electron.MenuItemConstructorOptions
  contextMenu?: Electron.MenuItemConstructorOptions
}
