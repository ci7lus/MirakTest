import fs from "fs"
import path from "path"
import {
  Rectangle,
  app,
  BrowserWindow,
  screen,
  ipcMain,
  Menu,
  shell,
  dialog,
} from "electron"
import Store from "electron-store"
import esm from "esm"
import objectHash from "object-hash"
import WebChimeraJs from "webchimera.js"
import pkg from "../package.json"
import {
  RECOIL_STATE_UPDATE,
  REQUEST_INITIAL_DATA,
  REQUEST_OPEN_PLAYER,
  REQUEST_OPEN_SETTINGS,
  REUQEST_OPEN_WINDOW,
} from "./constants/ipc"
import { OpenWindowArg, RecoilStateUpdateArg } from "./types/ipc"
import {
  AppInfo,
  InitPlugin,
  PluginDefineInMain,
  PluginInMainArgs,
} from "./types/plugin"
import { InitialData, ObjectLiteral } from "./types/struct"

const esmRequire = esm(module)

const backgroundColor = "#111827"

let primaryWindow: BrowserWindow | null = null
const contentPlayerWindows: BrowserWindow[] = []
let settingsWindow: BrowserWindow | null = null

const init = () => {
  if (process.platform == "win32" && WebChimeraJs.path) {
    const VLCPluginPath = path.join(WebChimeraJs.path, "plugins")
    console.info("win32 detected, VLC_PLUGIN_PATH:", VLCPluginPath)
    process.env["VLC_PLUGIN_PATH"] = VLCPluginPath
  }

  Menu.setApplicationMenu(buildAppMenu({ plugins: appMenus }))

  Store.initRenderer()
  const display = screen.getPrimaryDisplay()
  // store/bounds定義を引っ張ってくると目に見えて容量が増えるので決め打ち
  const store = new Store<{}>({
    // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    projectName: pkg.name,
  })
  const bounds: Rectangle | null = store.get(`${pkg.name}.contentPlayer.bounds`)
  const width = bounds?.width || Math.ceil(1280 / display.scaleFactor)
  const height = bounds?.height || Math.ceil(720 / display.scaleFactor)
  primaryWindow = new BrowserWindow({
    width,
    height,
    x: bounds?.x,
    y: bounds?.y,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor,
  })
  contentPlayerWindows.push(primaryWindow)

  primaryWindow.loadFile("index.html", { hash: "ContentPlayer" })
  if (process.env.NODE_ENV === "development") {
    primaryWindow.webContents.openDevTools()
  }
  primaryWindow.setAspectRatio(16 / 9)
  const [, contentHeight] = primaryWindow.getContentSize()
  const headerSize = height - contentHeight
  const minWidth = Math.ceil(640 / display.scaleFactor)
  const minHeight =
    Math.ceil(360 / display.scaleFactor) +
    Math.ceil(headerSize / display.scaleFactor)
  primaryWindow.setMinimumSize(minWidth, minHeight)
  primaryWindow.setSize(width, height + headerSize)
  const [xPos, yPos] = primaryWindow.getPosition()
  primaryWindow.setPosition(xPos, yPos - headerSize)

  primaryWindow.on("closed", () => {
    primaryWindow = null
    contentPlayerWindows.shift()
    if (0 < contentPlayerWindows.length) {
      primaryWindow = contentPlayerWindows[0]
      console.info("primaryWindow を更新しました", contentPlayerWindows[0].id)
    }
  })
}

app.on("ready", () => init())

app.allowRendererProcessReuse = false

app.on("window-all-closed", () => app.quit())

const buildAppMenu = ({
  plugins,
}: {
  plugins?: { [key: string]: Electron.MenuItemConstructorOptions }
}) => {
  const fileSubMenu: Electron.MenuItemConstructorOptions["submenu"] = [
    {
      label: "新しいプレイヤー",
      click: () => openPlayer(),
      accelerator: "CmdOrCtrl+N",
    },
  ]
  if (process.platform !== "darwin") {
    fileSubMenu?.push(
      {
        type: "separator",
      },
      {
        label: "設定",
        click: () => openSettings(),
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

  if (0 < Object.keys(plugins || {}).length) {
    const pluginItems = Object.entries(plugins || {}).map(([, item]) => item)
    items.push({
      label: "プラグイン",
      submenu: pluginItems,
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
          label: "設定",
          accelerator: "CmdOrCtrl+,",
          click: () => openSettings(),
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
let pluginPaths: string[] = []
const plugins: PluginDefineInMain[] = []
const appMenus: { [key: string]: Electron.MenuItemConstructorOptions } = {}
const loadPlugins = async () => {
  console.info("Load plugins from:", pluginsDir)
  if (!fs.existsSync(pluginsDir)) await fs.promises.mkdir(pluginsDir)
  const files = await fs.promises.readdir(pluginsDir)
  pluginPaths = files
    .filter((filePath) => filePath.endsWith(".plugin.js"))
    .map((filePath) => path.join(pluginsDir, filePath))
  console.info("plugins paths:", pluginPaths)
  const appInfo: AppInfo = { name: pkg.productName, version: pkg.version }
  const args: PluginInMainArgs = {
    appInfo,
    packages: {
      Electron: { ipcMain, app, browserWindow: BrowserWindow, dialog },
    },
    functions: {
      openWindow,
    },
  }
  const openedPlugins: PluginDefineInMain[] = []
  for (const pluginPath of pluginPaths) {
    try {
      const module: { default: InitPlugin } | InitPlugin =
        esmRequire(pluginPath)
      const load = "default" in module ? module.default : module
      if (load.main) {
        const plugin = await load.main(args)
        console.info(
          `[Plugin] 読込中: ${plugin.name} (${plugin.id}, ${plugin.version})`
        )
        openedPlugins.push(plugin)
      }
    } catch (error) {
      console.error(error)
    }
  }
  for (const plugin of openedPlugins) {
    try {
      await plugin.setup({ plugins: openedPlugins })
      if (plugin.appMenu) {
        appMenus[plugin.id] = plugin.appMenu
        console.info(`[Plugin] ${plugin.name} のアプリメニューを読み込みました`)
      }
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
  if (0 < Object.keys(appMenus).length) {
    Menu.setApplicationMenu(buildAppMenu({ plugins: appMenus }))
  }
}
loadPlugins()

ipcMain.handle(REQUEST_INITIAL_DATA, () => {
  const data: InitialData = {
    pluginPaths,
    states,
  }
  return data
})

const states: ObjectLiteral<unknown> = {}
const statesHash: ObjectLiteral<string> = {}

ipcMain.handle(RECOIL_STATE_UPDATE, (event, payload: RecoilStateUpdateArg) => {
  const { key, value } = payload
  if (!key) return
  const hash = objectHash(value)
  if (hash !== statesHash[key]) {
    statesHash[key] = hash
    states[key] = value
    for (const window of BrowserWindow.getAllWindows()) {
      if (window.webContents.id === event.sender.id) continue
      window.webContents.send(RECOIL_STATE_UPDATE, payload)
    }
  }
})

const openSettings = () => {
  if (settingsWindow) {
    settingsWindow.show()
  } else {
    const window = new BrowserWindow({
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: true,
      },
      backgroundColor,
      show: false,
    })
    window.loadFile("index.html", { hash: "Settings" })
    settingsWindow = window
    window.on("closed", () => {
      settingsWindow = null
    })
  }
}

ipcMain.on(REQUEST_OPEN_SETTINGS, openSettings)

const openPlayer = () => {
  if (!primaryWindow) {
    init()
    return
  }
  const { width, height } = primaryWindow.getBounds()
  const [minWidth, minHeight] = primaryWindow.getMinimumSize()
  const window = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor,
  })
  window.loadFile("index.html", { hash: "ContentPlayer" })
  window.setAspectRatio(16 / 9)
  contentPlayerWindows.push(window)
  if (primaryWindow === null) {
    primaryWindow = window
    console.info("primaryWindow を更新しました", window.id)
  }
  const _id = window.id
  window.on("closed", () => {
    const idx = contentPlayerWindows.indexOf(window)
    contentPlayerWindows.splice(idx, 1)
    if (primaryWindow?.id === _id) {
      primaryWindow = contentPlayerWindows[0]
      console.info("primaryWindow を更新しました", contentPlayerWindows[0].id)
    }
  })
}

ipcMain.on(REQUEST_OPEN_PLAYER, openPlayer)

const windowMapping: { [key: string]: BrowserWindow[] } = {}
const openWindow = ({
  name,
  isSingletone = false,
  args = {},
}: OpenWindowArg) => {
  const map = windowMapping[name] || []
  if (0 < map.length && isSingletone) {
    map[0].show()
    return map[0]
  } else {
    const { width, height } = primaryWindow?.getBounds() || {
      width: undefined,
      height: undefined,
    }
    const [minWidth, minHeight] = primaryWindow?.getMinimumSize() || [
      undefined,
      undefined,
    ]
    const window = new BrowserWindow({
      width,
      height,
      minWidth,
      minHeight,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
      },
      backgroundColor,
      ...args,
    })
    if (0 < windowMapping[name]?.length) {
      windowMapping[name].push(window)
    } else {
      windowMapping[name] = [window]
    }
    window.loadFile("index.html", { hash: name })
    window.on("closed", () => {
      const idx = windowMapping[name].indexOf(window)
      windowMapping[name].splice(idx, 1)
    })
    return window
  }
}

ipcMain.handle(REUQEST_OPEN_WINDOW, (_, args) => {
  return openWindow(args)?.id
})

const reloadTargetPaths = [
  path.resolve(__dirname, "../index.html"),
  path.resolve(__dirname, "index.electron.js"),
  path.resolve(__dirname, "../main.js"),
]

if (!require.main?.filename.includes("app.asar")) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("electron-reload")(reloadTargetPaths, {
      electron: process.execPath,
    })
    console.info("electron-reload enabled")
  } catch (e) {
    console.error(e)
  }
}
