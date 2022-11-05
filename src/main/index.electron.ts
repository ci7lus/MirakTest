import { EventEmitter } from "events"
import fs from "fs"
import { builtinModules, findSourceMap, SourceMap } from "module"
import path from "path"
import timers from "timers"
import vm from "vm"
import { transformAsync } from "@babel/core"
// @ts-expect-error dts not found
import babelTransformModulesCommonjs from "@babel/plugin-transform-modules-commonjs"
import electron, {
  Rectangle,
  app,
  BrowserWindow,
  screen,
  ipcMain,
  Menu,
  shell,
  dialog,
  Notification,
  globalShortcut,
  session,
  clipboard,
  nativeImage,
} from "electron"
import Store from "electron-store"
import fontList from "font-list"
import WebChimeraJs from "webchimera.js"
import pkg from "../../package.json"
import { contentPlayerIsPlayingAtomKey } from "../../src/atoms/contentPlayerKeys"
import { globalContentPlayerPlayingContentFamilyKey } from "../../src/atoms/globalFamilyKeys"
import {
  globalActiveContentPlayerIdAtomKey,
  globalLastEpgUpdatedAtomKey,
  globalDisabledPluginFileNamesAtomKey,
} from "../../src/atoms/globalKeys"
import {
  experimentalSettingAtomKey,
  screenshotSettingAtomKey,
} from "../../src/atoms/settingsKey"
import {
  REQUEST_CONFIRM_DIALOG,
  ON_WINDOW_MOVED,
  RECOIL_STATE_UPDATE,
  REQUEST_APP_PATH,
  REQUEST_CONTENT_BOUNDS,
  REQUEST_CURSOR_SCREEN_POINT,
  REQUEST_DIALOG,
  REQUEST_INITIAL_DATA,
  REUQEST_OPEN_WINDOW,
  SET_WINDOW_ASPECT,
  SET_WINDOW_CONTENT_BOUNDS,
  SET_WINDOW_POSITION,
  SET_WINDOW_TITLE,
  SHOW_NOTIFICATION,
  SHOW_WINDOW,
  TOGGLE_ALWAYS_ON_TOP,
  TOGGLE_FULL_SCREEN,
  REQUEST_SCREENSHOT_BASE_PATH,
  ON_SCREENSHOT_REQUEST,
  UPDATE_GLOBAL_SCREENSHOT_ACCELERATOR,
  EXIT_FULL_SCREEN,
  SET_WINDOW_BUTTON_VISIBILITY,
  REQUEST_WINDOW_SCREENSHOT,
  REQUEST_WRITE_IMAGE_TO_CLIPBOARD,
} from "../../src/constants/ipc"
import { ROUTES } from "../../src/constants/routes"
import {
  OpenContentPlayerWindowArgs,
  OpenWindowArg,
  SerializableKV,
} from "../../src/types/ipc"
import { AppInfo, InitPlugin, PluginInMainArgs } from "../../src/types/plugin"
import { InitialData, ObjectLiteral, PluginDatum } from "../../src/types/struct"
import { ExperimentalSetting, ScreenshotSetting } from "../types/setting"
import {
  ALLOWED_MODULES,
  BUILTIN_MODULES,
  FORBIDDEN_MODULES,
} from "./constants"
import { generateContentPlayerContextMenu } from "./contextmenu"
import { EPGManager } from "./epgManager"
import { exists, isChildOfHome, isHidden } from "./fsUtils"

let backgroundColor = "#111827"

const contentPlayerWindows: BrowserWindow[] = []

const CONTENT_PLAYER_BOUNDS = `${pkg.name}.contentPlayer.bounds`
const GLOBAL_CONTENT_PLAYER_IDS = `${pkg.name}.global.contentPlayerIds`

const isDev = process.env.NODE_ENV === "development"

let store: Store | null = null

let display: Electron.Display | null = null

let fonts: string[] = []
let disabledPluginFileNames: string[] = []

let watching: fs.FSWatcher | null = null

let isEnteringFullScreen = false

let globalScreenshotAccelerator: string | false = false
const registerGlobalScreenshotAccelerator = (accelerator: string | false) => {
  if (globalScreenshotAccelerator) {
    globalShortcut.unregister(globalScreenshotAccelerator)
    globalScreenshotAccelerator = false
  }
  if (accelerator === false) {
    return true
  }
  const result = globalShortcut.register(accelerator, () => {
    const activeId = states[globalActiveContentPlayerIdAtomKey]
    if (typeof activeId !== "number") {
      return
    }
    const window = BrowserWindow.fromId(activeId)
    window?.webContents.send(ON_SCREENSHOT_REQUEST, performance.now())
  })
  if (result) {
    globalScreenshotAccelerator = accelerator
    return true
  }
  return false
}

const init = async () => {
  if (process.platform == "win32" && WebChimeraJs.path) {
    const VLCPluginPath = path.join(WebChimeraJs.path, "plugins")
    console.info("win32 detected, VLC_PLUGIN_PATH:", VLCPluginPath)
    process.env["VLC_PLUGIN_PATH"] = VLCPluginPath
  }

  const REACT_EXT_PATH = process.env.REACT_EXT_PATH
  if (REACT_EXT_PATH) {
    await session.defaultSession.loadExtension(REACT_EXT_PATH)
    console.info("React Dev Tool Loaded:", REACT_EXT_PATH)
  }

  fontList
    .getFonts()
    .then((ls) => {
      fonts = ls
    })
    .catch(console.warn)

  Store.initRenderer()
  // store/bounds定義を引っ張ってくると目に見えて容量が増えるので決め打ち
  const _store = new Store({
    // @ts-expect-error workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
    projectName: pkg.name,
  })
  store = _store

  const experimentalSetting = _store.get(
    experimentalSettingAtomKey
  ) as ExperimentalSetting | null
  const isOk = registerGlobalScreenshotAccelerator(
    experimentalSetting?.globalScreenshotAccelerator || false
  )
  if (isOk) {
    console.info(
      "Configured globalScreenshotAccelerator:",
      experimentalSetting?.globalScreenshotAccelerator
    )
  } else {
    console.info(
      "Configuration of globalScreenshotAccelerator failed:",
      experimentalSetting?.globalScreenshotAccelerator
    )
  }
  if (experimentalSetting?.isCodeBlack === true) {
    backgroundColor = "#000000"
  }

  disabledPluginFileNames =
    (_store.get(globalDisabledPluginFileNamesAtomKey) as string[] | null) || []
  console.info(
    "Ignore plug-ins matching the following names:",
    disabledPluginFileNames
  )
  await loadPlugins({ ignoreFileNames: disabledPluginFileNames }).catch(
    console.error
  )

  const _display = screen.getPrimaryDisplay()
  display = _display
  openWindow({
    name: ROUTES["ContentPlayer"],
  })
}

app.on("ready", () => init())

app.on("window-all-closed", () => {
  if (watching) {
    watching.close()
    watching = null
  }
  registerGlobalScreenshotAccelerator(false)
  app.quit()
})

const buildAppMenu = ({
  pluginMenus,
}: {
  pluginMenus?: Electron.MenuItemConstructorOptions[]
}) => {
  const fileSubMenu: Electron.MenuItemConstructorOptions["submenu"] = [
    {
      label: "新しいプレイヤー",
      click: () =>
        openWindow({ name: ROUTES["ContentPlayer"], args: { show: false } }),
      accelerator: "CmdOrCtrl+N",
    },
    {
      type: "separator",
    },
    {
      label: "ウィンドウを閉じる",
      role: "close",
    },
  ]
  if (process.platform !== "darwin") {
    fileSubMenu.push(
      {
        type: "separator",
      },
      {
        label: "番組表",
        click: () =>
          openWindow({ name: ROUTES.ProgramTable, isSingletone: true }),
        accelerator: "CmdOrCtrl+B",
      },
      {
        label: "設定",
        click: () => openWindow({ name: "Settings", isSingletone: true }),
        accelerator: "CmdOrCtrl+P",
      },
      {
        type: "separator",
      },
      {
        label: `${app.name} を終了`,
        role: "quit",
      }
    )
  }
  const items: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: "ファイル",
      role: "fileMenu",
      submenu: fileSubMenu,
    },
    {
      label: "編集",
      role: "editMenu",
    },
    {
      label: "表示",
      role: "viewMenu",
    },
    { label: "ウィンドウ", role: "windowMenu" },
  ]

  if (0 < (pluginMenus || []).length) {
    items.push({
      label: "プラグイン",
      submenu: pluginMenus,
    })
  }

  items.push({
    label: "ヘルプ",
    role: "help",
    submenu: [
      {
        label: "リポジトリを開く",
        click: () => shell.openExternal(pkg.repository.url.replace(".git", "")),
      },
      {
        label: "問題を報告する",
        click: () =>
          shell.openExternal(
            pkg.repository.url.replace(".git", "") + "/issues"
          ),
      },
    ],
  })

  if (process.platform === "darwin") {
    items.unshift({
      label: app.name,
      submenu: [
        {
          label: `${app.name} について`,
          role: "about",
        },
        {
          type: "separator",
        },
        {
          label: "番組表",
          click: () =>
            openWindow({ name: ROUTES.ProgramTable, isSingletone: true }),
          accelerator: "CmdOrCtrl+B",
        },
        {
          label: "設定",
          accelerator: "CmdOrCtrl+,",
          click: () => openWindow({ name: "Settings", isSingletone: true }),
        },
        {
          type: "separator",
        },
        {
          label: `${app.name} を隠す`,
          role: "hide",
        },
        {
          label: "ほか隠す",
          role: "hideOthers",
        },
        {
          label: "すべて表示",
          role: "unhide",
        },
        {
          type: "separator",
        },
        {
          label: `${app.name} を終了`,
          role: "quit",
        },
      ],
    })
  }

  return Menu.buildFromTemplate(items)
}

const userDataDir = app.getPath("userData")
const pluginsDir = path.join(userDataDir, "plugins")
const pluginData = new Map<string, PluginDatum>()
const getPluginFileAbsolutePath = (fileName: string) => {
  return path.join(pluginsDir, fileName)
}
const pluginLoader = async (fileName: string): Promise<PluginDatum | false> => {
  const filePath = getPluginFileAbsolutePath(fileName)
  try {
    const content = await fs.promises.readFile(filePath, "utf8")
    return { content, filePath, fileName }
  } catch (e) {
    console.error(e)
    return false
  }
}
const pluginsVMContext = vm.createContext({ console })
const promises = new Proxy(fs.promises, {
  get:
    (target, name) =>
    async (path: string, ...args: unknown[]) => {
      const isNotChild = !isChildOfHome(path)
      const isAlreadyExists = await exists(path)
      const isHiddenFile = isHidden(path)
      if (isNotChild || isAlreadyExists || isHiddenFile) {
        const ask = await dialog.showMessageBox(undefined as never, {
          message: `「${path}」${
            isHiddenFile
              ? "は隠しファイルです。"
              : isNotChild
              ? "はホームディレクトリの外です。"
              : "は既に存在します。"
          }${name.toString()}を許可しますか？`,
          buttons: ["許可する", "拒否する"],
          type: "question",
        })
        if (ask.response !== 0) {
          throw new Error("denied")
        }
      }
      // @ts-expect-error proxy
      return target[name](path, ...args)
    },
})
const fakeModule = (fileName: string) => ({
  builtinModules: builtinModules.filter(
    (mod) => !FORBIDDEN_MODULES.includes(mod)
  ),
  createRequire: () => pluginRequire(fileName),
  findSourceMap,
  SourceMap,
})
const pluginRequire = (fileName: string) => (s: string) => {
  if (ALLOWED_MODULES.includes(s)) {
    return require(/* webpackIgnore: true */ s)
  }
  console.info(`[Plugin] ${fileName}" requesting "${s}".`)
  if (s === "electron") {
    return electron
  }
  if (["fs", "node:fs"].includes(s)) {
    return { promises }
  }
  if (["fs/promises", "node:fs/promises"].includes(s)) {
    return promises
  }
  if (["module", "node:module"].includes(s)) {
    return fakeModule(fileName)
  }
  if (
    s.startsWith("_") ||
    FORBIDDEN_MODULES.includes(s) ||
    !BUILTIN_MODULES.includes(s)
  ) {
    throw new Error("Forbidden module: " + s)
  }
  return require(/* webpackIgnore: true */ s)
}
const esmToCjs = async (code: string) => {
  const transformed = await transformAsync(code, {
    plugins: [babelTransformModulesCommonjs],
    compact: false,
  })
  if (!transformed || !transformed.code) {
    throw new Error("[Plugin] cjs transform failed")
  }
  return transformed.code
}
const eventEmitter = new EventEmitter()
const loadPlugins = async ({
  ignoreFileNames,
}: {
  ignoreFileNames: string[]
}) => {
  const sandboxJsInit = await fs.promises.readFile(
    `${__dirname}/src/main/vm/init.js`,
    "utf8"
  )
  const sandboxJsSetup = await fs.promises.readFile(
    `${__dirname}/src/main/vm/setup.js`,
    "utf8"
  )
  vm.runInContext("const exports = {};", pluginsVMContext)
  vm.runInContext(sandboxJsInit, pluginsVMContext)
  console.info("Load plugins from:", pluginsDir)
  if (!fs.existsSync(pluginsDir)) {
    await fs.promises.mkdir(pluginsDir)
  }
  const files = await fs.promises.readdir(pluginsDir)
  for await (const plugin of (
    await Promise.all(
      files
        .filter((filePath) => filePath.endsWith(".plugin.js"))
        .map(pluginLoader)
    )
  ).filter((plugin): plugin is PluginDatum => !!plugin)) {
    pluginData.set(plugin.fileName, plugin)
    console.info(`[Plugin] Loaded: ${plugin.fileName}`)
  }
  console.info(
    "[Plugin] Initial load plugins:",
    Array.from(pluginData.values()).map((p) => p.filePath)
  )
  const appInfo: AppInfo = { name: pkg.productName, version: pkg.version }
  const args: PluginInMainArgs = {
    appInfo,
    packages: {
      Electron: {
        app,
        browserWindow: BrowserWindow,
        dialog,
        ipcMain,
        session,
      },
      events: {
        eventEmitter,
      },
    },
    functions: {
      openWindow: (args: OpenWindowArg) => {
        const isBuiltin = (Object.values(ROUTES) as string[]).includes(
          args.name
        )
        if (isBuiltin) {
          throw new Error("ビルトイン画面を開くには専用の関数を用いてください")
        }
        return openWindow(args)
      },
      openBuiltinWindow: ({
        name,
      }: {
        name: Omit<keyof typeof ROUTES, typeof ROUTES["ContentPlayer"]>
      }) => {
        openWindow({
          name: name as string,
          isSingletone: true,
          args: { show: false },
        })
      },
      openContentPlayerWindow: ({
        playingContent,
      }: OpenContentPlayerWindowArgs) => {
        return openWindow({
          name: ROUTES["ContentPlayer"],
          isSingletone: false,
          playingContent,
        })
      },
    },
  }
  const setAppMenu = (pluginMenus: Electron.MenuItemConstructorOptions[]) => {
    Menu.setApplicationMenu(buildAppMenu({ pluginMenus }))
  }
  const moduleLoader = async (fileName: string, code: string) => {
    const ctx = vm.createContext({
      require: pluginRequire(fileName),
      Buffer,
      process,
      console,
      timers,
    })
    vm.runInContext(
      `const global = globalThis;
      Object.assign(globalThis, timers);
      const exports = {};`,
      ctx
    )
    const cjscode = await esmToCjs(code)
    const mod: InitPlugin = vm.runInContext(cjscode, ctx)
    await vm.runInContext("setupModule", pluginsVMContext)(fileName, mod, args)
  }
  await Promise.all(
    Array.from(pluginData.values())
      .filter(({ fileName }) => !ignoreFileNames.find((n) => n === fileName))
      .map(async ({ fileName, content }) => {
        try {
          await moduleLoader(fileName, content)
        } catch (error) {
          console.error(error)
        }
      })
  )
  await vm.runInContext(sandboxJsSetup, pluginsVMContext)
  vm.runInContext("setAppMenu", pluginsVMContext)(setAppMenu)
  watching = fs.watch(
    pluginsDir,
    { recursive: false },
    async (eventType, fileName) => {
      if (!fileName.endsWith(".plugin.js")) {
        return
      }
      const loadedDatum = pluginData.get(fileName)
      let pluginDisplay: string | null = null
      const datum = await pluginLoader(fileName)
      if (datum && loadedDatum?.content === datum.content) {
        console.info(
          `[Plugin] Skip since there is no change in the file contents: ${fileName}`
        )
        return
      }
      if (loadedDatum) {
        try {
          pluginDisplay = await vm.runInContext(
            "getPluginDisplay",
            pluginsVMContext
          )(fileName)
        } catch {}
        try {
          await vm.runInContext("destroyPlugin", pluginsVMContext)(fileName)
        } catch (error) {
          console.error(error, fileName)
        }
        pluginData.delete(fileName)
      }
      if (!datum) {
        new Notification({
          title: "プラグインを読み込み解除しました",
          body: pluginDisplay || fileName,
        }).show()
        return
      }
      console.info(`[Plugin] Loaded: ${datum.fileName}`)
      pluginData.set(fileName, datum)
      pluginDisplay = null
      try {
        await moduleLoader(datum.fileName, datum.content)
        pluginDisplay = await vm.runInContext(
          "setupPlugin",
          pluginsVMContext
        )(fileName)
      } catch (e) {
        console.error(e, fileName)
        await vm.runInContext("destroyPlugin", pluginsVMContext)(fileName)
      }
      vm.runInContext("setAppMenu", pluginsVMContext)(setAppMenu)
      new Notification({
        title: pluginDisplay
          ? loadedDatum
            ? "プラグインを再読み込みしました"
            : "プラグインを読み込みました"
          : "プラグインの読み込みに失敗した可能性があります",
        body: pluginDisplay || fileName,
      }).show()
    }
  )
}

app.on("before-quit", () => {
  pluginData.forEach((datum, key) => {
    try {
      vm.runInContext("destroyPlugin", pluginsVMContext)(datum.fileName)
      console.info(`[Plugin] Destroyed: ${datum.fileName}`)
    } catch (error) {
      console.error(error, key)
    }
  })
})

ipcMain.handle(REQUEST_INITIAL_DATA, (event) => {
  const data: InitialData = {
    pluginData: Array.from(pluginData.values()),
    states,
    fonts,
    windowId: BrowserWindow.fromWebContents(event.sender)?.id ?? -1,
    disabledPluginFileNames,
  }
  return data
})

const states: ObjectLiteral<unknown> = {}
const statesHash: ObjectLiteral<string> = {}

// 生Recoil総括
const recoilStateUpdate = (payload: SerializableKV) => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(RECOIL_STATE_UPDATE, payload)
  }
  states[payload.key] = payload.value
}

const updateContentPlayerIds = () => {
  recoilStateUpdate({
    key: GLOBAL_CONTENT_PLAYER_IDS,
    value: contentPlayerWindows.map((w) => w.id),
  })
}

ipcMain.handle(RECOIL_STATE_UPDATE, (event, payload: SerializableKV) => {
  const { key, value } = payload
  if (!key) return
  const hash = JSON.stringify(value)
  if (hash !== statesHash[key]) {
    statesHash[key] = hash
    states[key] = value
  }
})

const windowMapping: { [key: string]: BrowserWindow[] } = {}
const openWindow = ({
  name,
  isSingletone = false,
  args = {},
  playingContent,
}: OpenWindowArg) => {
  const map = windowMapping[name] || []
  if (0 < map.length && isSingletone) {
    map[0].show()
    return map[0]
  } else {
    let width: number | undefined = undefined
    let x: number | undefined = undefined
    let y: number | undefined = undefined
    let height: number | undefined = undefined
    const sampleWindow = contentPlayerWindows?.[0]
    if (name === ROUTES["ContentPlayer"]) {
      const bounds = sampleWindow?.getBounds()
      if (bounds) {
        width = bounds.width
        height = bounds.height
        x = bounds.x + 30
        y = bounds.y + 30
      } else if (display) {
        const bounds = (store?.get(CONTENT_PLAYER_BOUNDS) as Rectangle) || null
        width = bounds?.width || Math.ceil(1280 / display.scaleFactor)
        height = bounds?.height || Math.ceil(720 / display.scaleFactor)
        x = bounds?.x
        y = bounds?.y
        // 2ウィンドウ目以降はかぶらないようにちょっとずらす
        if (x && y && contentPlayerWindows.length !== 0) {
          x += 30
          y += 30
        }
      }
    }
    const [minWidth, minHeight] = sampleWindow?.getMinimumSize() || [
      undefined,
      undefined,
    ]
    const window = new BrowserWindow({
      width,
      height,
      x,
      y,
      minWidth,
      minHeight,
      webPreferences: {
        preload: `${__dirname}/src/main/preload.js`,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
      backgroundColor,
      titleBarStyle:
        process.platform === "darwin" && name === ROUTES.ContentPlayer
          ? "hiddenInset"
          : undefined,
      titleBarOverlay:
        process.platform === "darwin" && name === ROUTES.ContentPlayer
          ? true
          : undefined,
      autoHideMenuBar: process.platform === "win32" ? true : undefined,
      ...args,
    })
    const [, contentHeight] = window.getContentSize()
    if (width && height && display && name === ROUTES["ContentPlayer"]) {
      const headerSize = height - contentHeight
      if (!sampleWindow) {
        window.setSize(width, height + headerSize)
      }
      const minWidth = Math.ceil(640 / display.scaleFactor)
      const minHeight =
        Math.ceil(360 / display.scaleFactor) +
        Math.ceil(headerSize / display.scaleFactor)
      window.setMinimumSize(minWidth, minHeight)

      if (isDev) {
        window.webContents.openDevTools()
      }

      if (playingContent) {
        // 生Recoil
        states[`${globalContentPlayerPlayingContentFamilyKey}__${window.id}`] =
          playingContent
      }

      // Windows/Linux は上下が見切れるのでアスペクト比を制限しない
      if (process.platform === "darwin") {
        if (!isDev) {
          window.setAspectRatio(16 / 9)
        }
        if (contentPlayerWindows.length === 0) {
          window.setSize(width, height + headerSize)
          const [xPos, yPos] = window.getPosition()
          window.setPosition(xPos, yPos - headerSize)
        }
      }

      contentPlayerWindows.push(window)
      updateContentPlayerIds()
    }

    window.webContents.setWindowOpenHandler(({ url }) => {
      if (url === "about:blank") {
        return { action: "allow" }
      } else if (url.startsWith("http")) {
        shell.openExternal(url)
        return { action: "deny" }
      } else {
        return { action: "deny" }
      }
    })

    const isPlayingKey = `${contentPlayerIsPlayingAtomKey}__${window.id}`

    window.webContents.on("context-menu", (e, params) => {
      vm.runInContext(
        "showContextMenu",
        pluginsVMContext
      )(
        generateContentPlayerContextMenu(
          {
            isPlaying:
              name === ROUTES.ContentPlayer ? !!states[isPlayingKey] : null,
            toggleIsPlaying: () => {
              recoilStateUpdate({
                key: isPlayingKey,
                value: !states[isPlayingKey],
              })
            },
            isAlwaysOnTop: window.isAlwaysOnTop(),
            toggleIsAlwaysOnTop: () => {
              window.setAlwaysOnTop(!window.isAlwaysOnTop())
            },
            openContentPlayer: () =>
              openWindow({
                name: ROUTES.ContentPlayer,
                args: { show: false },
              }),
            openSetting: () =>
              openWindow({
                name: ROUTES.Settings,
                isSingletone: true,
                args: { show: false },
              }),
            openProgramTable: () =>
              openWindow({
                name: ROUTES.ProgramTable,
                isSingletone: true,
                args: { show: false },
              }),
          },
          e,
          params
        )
      )
    })

    window.on("moved", () => {
      window.webContents.send(ON_WINDOW_MOVED)
    })
    const setActiveContentPlayer = () => {
      if (name !== ROUTES["ContentPlayer"]) {
        return
      }
      recoilStateUpdate({
        key: globalActiveContentPlayerIdAtomKey,
        value: window.id,
      })
    }
    window.on("focus", setActiveContentPlayer)
    setActiveContentPlayer()
    // TODO: フルスクリーン操作周辺で信号機が消えていると消失しちゃうのの Workaround
    window.on("enter-full-screen", () => {
      isEnteringFullScreen = true
      if (window.setWindowButtonVisibility) {
        window.setWindowButtonVisibility(true)
      }
    })
    window.on("leave-full-screen", () => {
      isEnteringFullScreen = false
    })

    if (isDev) {
      window.webContents.session.webRequest.onBeforeSendHeaders(
        (details, callback) => {
          const requestHeaders = {
            ...details.requestHeaders,
          }
          if (
            requestHeaders.Origin &&
            !details.url.startsWith("ws://localhost:")
          ) {
            delete requestHeaders.Origin
          }
          callback({
            requestHeaders,
          })
        }
      )
      window.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
          const responseHeaders = details.responseHeaders || {}
          const keys = Object.keys(responseHeaders)
          for (const [key, value] of Object.entries({
            "Access-Control-Allow-Origin": ["*"],
            "Access-Control-Allow-Headers": ["*, Authorization"],
            "Access-Control-Allow-Methods": ["*"],
            "Access-Control-Allow-Credentials": ["true"],
          })) {
            if (!keys.includes(key.toLowerCase())) {
              responseHeaders[key] = value
            }
          }
          callback({
            responseHeaders,
            statusLine:
              details.method === "OPTIONS"
                ? details.statusLine.split(" ")[0] + " 200"
                : details.statusLine,
          })
        }
      )
    }

    if (0 < windowMapping[name]?.length) {
      windowMapping[name].push(window)
    } else {
      windowMapping[name] = [window]
    }

    if (isDev) {
      window.loadURL("http://localhost:10170/index.html#" + name)
    } else {
      window.loadFile("index.html", { hash: name })
    }

    const _id = window.id
    window.on("closed", () => {
      const idx = windowMapping[name].indexOf(window)
      windowMapping[name].splice(idx, 1)
      if (name === ROUTES["ContentPlayer"]) {
        const idx = contentPlayerWindows.indexOf(window)
        contentPlayerWindows.splice(idx, 1)
        updateContentPlayerIds()
        if (states[globalActiveContentPlayerIdAtomKey] === _id) {
          const value = contentPlayerWindows.slice(0).shift()?.id ?? null
          recoilStateUpdate({
            key: globalActiveContentPlayerIdAtomKey,
            value,
          })
        }
      }
    })
    return window
  }
}

ipcMain.handle(REUQEST_OPEN_WINDOW, (_, args) => {
  return openWindow(args)?.id
})

ipcMain.handle(SET_WINDOW_TITLE, (event, title) => {
  BrowserWindow.fromWebContents(event.sender)?.setTitle(title)
})

ipcMain.handle(
  SET_WINDOW_ASPECT,
  (event, aspect) =>
    !isDev &&
    process.platform === "darwin" &&
    BrowserWindow.fromWebContents(event.sender)?.setAspectRatio(aspect)
)

ipcMain.handle(SET_WINDOW_POSITION, (event, x, y) => {
  BrowserWindow.fromWebContents(event.sender)?.setPosition(x, y)
})

ipcMain.handle(SHOW_WINDOW, (event) => {
  BrowserWindow.fromWebContents(event.sender)?.show()
})

ipcMain.handle(REQUEST_APP_PATH, (_, path) => {
  return app.getPath(path)
})

ipcMain.handle(REQUEST_CURSOR_SCREEN_POINT, () => {
  return screen.getCursorScreenPoint()
})

ipcMain.handle(TOGGLE_FULL_SCREEN, (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window || !window.isFullScreenable()) {
    return
  }
  const isFullScreen = window.isFullScreen()
  if (!isFullScreen) {
    // TODO: フルスクリーン操作周辺で信号機が消えていると消失しちゃうのの Workaround
    isEnteringFullScreen = true
    if (window.setWindowButtonVisibility) {
      window.setWindowButtonVisibility(true)
    }
  }
  window.setFullScreen(!isFullScreen)
})

ipcMain.handle(EXIT_FULL_SCREEN, (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) {
    return
  }
  window.setFullScreen(false)
})

ipcMain.handle(SET_WINDOW_BUTTON_VISIBILITY, (event, visibility: boolean) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) {
    return
  }
  // TODO: フルスクリーン操作周辺で信号機が消えていると消失しちゃうのの Workaround
  if (window.isFullScreen() || isEnteringFullScreen) {
    if (window.setWindowButtonVisibility) {
      window.setWindowButtonVisibility(true)
    }
    return
  }
  if (window.setWindowButtonVisibility) {
    window.setWindowButtonVisibility(visibility)
  }
})

ipcMain.handle(SHOW_NOTIFICATION, (_, arg, path) => {
  const n = new Notification(arg)
  if (path) {
    n.on("click", () => shell.openPath(path))
  }
  n.show()
})

ipcMain.handle(REQUEST_WINDOW_SCREENSHOT, async (event, fileName: string) => {
  const setting = store?.get(screenshotSettingAtomKey) as ScreenshotSetting
  const { basePath, keepQuality } = setting
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window || !basePath || !fileName) {
    return
  }
  const fileNameWithExt = fileName + (keepQuality ? ".png" : ".jpg")
  const filePath = path.join(basePath, fileNameWithExt)
  const image = await window.webContents.capturePage()
  clipboard.writeImage(image)
  await fs.promises.writeFile(
    filePath,
    keepQuality === true ? image.toPNG() : image.toJPEG(95)
  )
  const n = new Notification({
    title: "スクリーンショットを撮影しました",
    body: `${fileNameWithExt} (クリックで開く)`,
  })
  n.on("click", () => shell.openPath(filePath))
  n.show()
  return image.toDataURL()
})

ipcMain.handle(TOGGLE_ALWAYS_ON_TOP, (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (!window) {
    return
  }
  window.setAlwaysOnTop(!window.isAlwaysOnTop())
})

ipcMain.handle(REQUEST_CONTENT_BOUNDS, (event) => {
  return BrowserWindow.fromWebContents(event.sender)?.getContentBounds()
})

ipcMain.handle(SET_WINDOW_CONTENT_BOUNDS, (event, bounds) => {
  BrowserWindow.fromWebContents(event.sender)?.setContentBounds(bounds)
})

ipcMain.handle(REQUEST_DIALOG, async (_, args) => {
  return await dialog.showOpenDialog(args)
})

ipcMain.handle(
  REQUEST_WRITE_IMAGE_TO_CLIPBOARD,
  async (_, arr: ArrayBuffer) => {
    const image = nativeImage.createFromBuffer(Buffer.from(arr))
    clipboard.writeImage(image)
  }
)

ipcMain.handle(REQUEST_CONFIRM_DIALOG, async (event, message, buttons) => {
  return await dialog.showMessageBox(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    BrowserWindow.fromWebContents(event.sender)!,
    {
      message,
      buttons,
      type: "question",
    }
  )
})

ipcMain.handle(REQUEST_SCREENSHOT_BASE_PATH, async () => {
  return (
    (store?.get(screenshotSettingAtomKey) as ScreenshotSetting)?.basePath ||
    null
  )
})

ipcMain.handle(
  UPDATE_GLOBAL_SCREENSHOT_ACCELERATOR,
  (_, accelerator: string | false) => {
    const isOk = registerGlobalScreenshotAccelerator(accelerator)
    if (isOk) {
      console.info("Updated globalScreenshotAccelerator:", accelerator)
    } else {
      console.info("Failed to update globalScreenshotAccelerator:", accelerator)
    }
    return isOk
  }
)

let lastEpgUpdated = 0

new EPGManager(ipcMain, () => {
  const value = Math.floor(performance.now())
  // 5秒に1回のみ
  if (value - lastEpgUpdated < 5000) {
    return
  }
  lastEpgUpdated = value
  // 生Recoil
  states[globalLastEpgUpdatedAtomKey] = value
  recoilStateUpdate({
    key: globalLastEpgUpdatedAtomKey,
    value,
  })
})
