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
  powerSaveBlocker,
  Notification,
} from "electron"
import Store from "electron-store"
import esm from "esm"
import fontList from "font-list"
import { NodeVM } from "vm2"
import WebChimeraJs from "webchimera.js"
import pkg from "../../package.json"
import { globalContentPlayerPlayingContentFamilyKey } from "../../src/atoms/globalFamilyKeys"
import { globalActiveContentPlayerIdAtomKey } from "../../src/atoms/globalKeys"
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
  UPDATE_IS_PLAYING_STATE,
} from "../../src/constants/ipc"
import { ROUTES } from "../../src/constants/routes"
import {
  OpenContentPlayerWindowArgs,
  OpenWindowArg,
  SerializableKV,
} from "../../src/types/ipc"
import { AppInfo, PluginInMainArgs } from "../../src/types/plugin"
import { InitialData, ObjectLiteral, PluginDatum } from "../../src/types/struct"
import { generateContentPlayerContextMenu } from "./contextmenu"
import { EPGManager } from "./epgManager"

const backgroundColor = "#111827"

const contentPlayerWindows: BrowserWindow[] = []

const CONTENT_PLAYER_BOUNDS = `${pkg.name}.contentPlayer.bounds`
const GLOBAL_CONTENT_PLAYER_IDS = `${pkg.name}.global.contentPlayerIds`

const blockerIdBycontentPlayerWindow: { [key: number]: number | null } = {}

const isDev = process.env.NODE_ENV === "development"

let store: Store<{
  [key: typeof CONTENT_PLAYER_BOUNDS]: Rectangle
}> | null = null

let display: Electron.Display | null = null

let fonts: string[] = []

let watching: fs.FSWatcher | null = null

const init = () => {
  if (process.platform == "win32" && WebChimeraJs.path) {
    const VLCPluginPath = path.join(WebChimeraJs.path, "plugins")
    console.info("win32 detected, VLC_PLUGIN_PATH:", VLCPluginPath)
    process.env["VLC_PLUGIN_PATH"] = VLCPluginPath
  }

  fontList
    .getFonts()
    .then((ls) => {
      fonts = ls
    })
    .catch(console.error)

  Store.initRenderer()
  // store/bounds定義を引っ張ってくると目に見えて容量が増えるので決め打ち
  const _store = new Store<{ [key: typeof CONTENT_PLAYER_BOUNDS]: Rectangle }>({
    // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    projectName: pkg.name,
  })
  store = _store
  const _display = screen.getPrimaryDisplay()
  display = _display
  openWindow({
    name: ROUTES["ContentPlayer"],
  })
}

app.on("ready", () => init())

app.allowRendererProcessReuse = false

app.on("window-all-closed", () => {
  if (watching) {
    watching.close()
    watching = null
  }
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
  ]
  if (process.platform !== "darwin") {
    fileSubMenu?.push(
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
const pluginLoader = async (fileName: string) => {
  const filePath = path.join(pluginsDir, fileName)
  const content = await fs.promises.readFile(filePath, "utf8")
  return { content, filePath, fileName }
}
const pluginVM = new NodeVM({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  strict: true,
  require: {
    external: false,
    builtin: ["module", "vm", "fs", "path", "os", "url", "util"],
    context: "sandbox",
  },
})
const loadPlugins = async () => {
  console.info("Load plugins from:", pluginsDir)
  if (!fs.existsSync(pluginsDir)) await fs.promises.mkdir(pluginsDir)
  const files = await fs.promises.readdir(pluginsDir)
  for (const plugin of await Promise.all(
    files
      .filter((filePath) => filePath.endsWith(".plugin.js"))
      .map(pluginLoader)
  )) {
    pluginData.set(plugin.fileName, plugin)
    console.info(`[Plugin] ロードしました: ${plugin.fileName}`)
  }
  console.info(
    "[Plugin] 初期ロードプラグイン:",
    Array.from(pluginData.values()).map((p) => p.filePath)
  )
  const appInfo: AppInfo = { name: pkg.productName, version: pkg.version }
  const args: PluginInMainArgs = {
    appInfo,
    packages: {
      Electron: { ipcMain, app, browserWindow: BrowserWindow, dialog },
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
    if (0 < pluginMenus.length) {
      Menu.setApplicationMenu(buildAppMenu({ pluginMenus }))
    }
  }
  const setAppMenuCode = "globalThis.setAppMenu()"
  pluginVM.sandbox.esm = esm
  pluginVM.sandbox.sandboxArgs = args
  pluginVM.sandbox.sandboxSetMenu = setAppMenu
  pluginVM.runFile("./dist/src/main/vm/init.js")
  pluginVM.sandbox.esm = null
  pluginVM.sandbox.sandboxArgs = null
  pluginVM.sandbox.sandboxSetMenu = null
  const moduleLoader = async (filePath: string, fileName: string) => {
    await pluginVM.run(
      `module.exports = globalThis.loadModule("${filePath}", "${fileName}")`,
      `${fileName}.load.js`
    )
  }
  await Promise.all(
    Array.from(pluginData.values()).map(async ({ filePath, fileName }) => {
      try {
        await moduleLoader(filePath, fileName)
      } catch (error) {
        console.error(error)
      }
    })
  )
  await pluginVM.runFile("./dist/src/main/vm/setup.js")
  pluginVM.run(setAppMenuCode, "setAppMenu.js")
  watching = fs.watch(
    pluginsDir,
    { recursive: false },
    async (eventType, fileName) => {
      if (!fileName.endsWith(".plugin.js")) {
        return
      }
      await pluginVM.run(
        `module.exports = globalThis.destroyPlugin("${fileName}")`,
        `${fileName}.destroy.js`
      )
      pluginData.delete(fileName)
      pluginVM.run(setAppMenuCode, "setAppMenu.js")
      if (eventType === "change") {
        try {
          const datum = await pluginLoader(fileName)
          pluginData.set(fileName, datum)
          console.info(`[Plugin] ロードしました: ${datum.fileName}`)
          await moduleLoader(datum.filePath, datum.fileName)
          await pluginVM.run(
            `module.exports = globalThis.setupPlugin("${datum.fileName}")`,
            `${datum.fileName}.setup.js`
          )
          pluginVM.run(setAppMenuCode)
        } catch (e) {
          console.error(e, fileName)
          await pluginVM.run(
            `module.exports = globalThis.destroyPlugin("${fileName}")`,
            `${fileName}.destroy.js`
          )
          pluginData.delete(fileName)
        }
      }
    }
  )
}
loadPlugins()

ipcMain.handle(REQUEST_INITIAL_DATA, (event) => {
  const data: InitialData = {
    pluginData: Array.from(pluginData.values()),
    states,
    fonts,
    windowId: BrowserWindow.fromWebContents(event.sender)?.id ?? -1,
  }
  return data
})

ipcMain.handle(UPDATE_IS_PLAYING_STATE, (event, isPlaying: boolean) => {
  const windowId = BrowserWindow.fromWebContents(event.sender)?.id
  if (!windowId) {
    return
  }
  if (isPlaying) {
    const blockerId = blockerIdBycontentPlayerWindow[windowId]
    if (typeof blockerId !== "number") {
      blockerIdBycontentPlayerWindow[windowId] = powerSaveBlocker.start(
        "prevent-display-sleep"
      )
    }
  } else {
    const blockerId = blockerIdBycontentPlayerWindow[windowId]
    if (typeof blockerId === "number") {
      powerSaveBlocker.stop(blockerId)
      blockerIdBycontentPlayerWindow[windowId] = null
    }
  }
})

const states: ObjectLiteral<unknown> = {}
const statesHash: ObjectLiteral<string> = {}

const recoilStateUpdate = (source: number, payload: SerializableKV) => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.webContents.id === source) continue
    window.webContents.send(RECOIL_STATE_UPDATE, payload)
  }
}

const updateContentPlayerIds = () => {
  recoilStateUpdate(-1, {
    key: GLOBAL_CONTENT_PLAYER_IDS,
    value: contentPlayerWindows.map((w) => w.id),
  })
  // 生Recoil
  states[GLOBAL_CONTENT_PLAYER_IDS] = contentPlayerWindows.map((w) => w.id)
}

ipcMain.handle(RECOIL_STATE_UPDATE, (event, payload: SerializableKV) => {
  const { key, value } = payload
  if (!key) return
  const hash = JSON.stringify(value)
  if (hash !== statesHash[key]) {
    statesHash[key] = hash
    states[key] = value
    recoilStateUpdate(event.sender.id, payload)
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
        const bounds: Rectangle | null =
          store?.get(CONTENT_PLAYER_BOUNDS) || null
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
        preload: `${__dirname}/preload.js`,
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        worldSafeExecuteJavaScript: true,
      },
      backgroundColor,
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
        window.setAspectRatio(16 / 9)
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

    window.webContents.on("context-menu", (e, params) => {
      pluginVM.sandbox.sandboxSetContextMenu = generateContentPlayerContextMenu(
        {
          isPlaying:
            name === ROUTES.ContentPlayer
              ? window.id in blockerIdBycontentPlayerWindow &&
                blockerIdBycontentPlayerWindow[window.id] !== null
              : null,
          toggleIsPlaying: () => {
            window.webContents.send(UPDATE_IS_PLAYING_STATE)
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
      pluginVM.run("module.exports = globalThis.showContextMenu()")
      pluginVM.sandbox.sandboxSetContextMenu = null
    })

    window.on("moved", () => {
      window.webContents.send(ON_WINDOW_MOVED)
    })

    if (isDev) {
      window.webContents.session.webRequest.onBeforeSendHeaders(
        (details, callback) => {
          callback({
            requestHeaders: { Origin: "*", ...details.requestHeaders },
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
          callback({ responseHeaders })
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
        const blockerId = blockerIdBycontentPlayerWindow[_id]
        if (typeof blockerId === "number") {
          powerSaveBlocker.stop(blockerId)
        }
        const idx = contentPlayerWindows.indexOf(window)
        contentPlayerWindows.splice(idx, 1)
        updateContentPlayerIds()
        if (states[globalActiveContentPlayerIdAtomKey] === _id) {
          const value = contentPlayerWindows.slice(0).shift()?.id ?? null
          // 生Recoil
          states[globalActiveContentPlayerIdAtomKey] = value
          recoilStateUpdate(_id, {
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

ipcMain.handle(SET_WINDOW_ASPECT, (event, aspect) =>
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
  window.setFullScreen(!window.isFullScreen())
})

ipcMain.handle(SHOW_NOTIFICATION, (_, arg, path) => {
  const n = new Notification(arg)
  if (path) {
    n.on("click", () => shell.openPath(path))
  }
  n.show()
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

ipcMain.handle(REQUEST_DIALOG, async () => {
  return await dialog.showOpenDialog({
    properties: ["openFile", "openDirectory"],
  })
})

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

new EPGManager(ipcMain)
