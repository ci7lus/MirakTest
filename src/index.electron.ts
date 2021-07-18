import path from "path"
import { Rectangle, app, BrowserWindow, screen } from "electron"
import Store from "electron-store"
import WebChimeraJs from "webchimera.js"
import pkg from "../package.json"

let window: BrowserWindow | null = null

const init = () => {
  if (process.platform == "win32" && WebChimeraJs.path) {
    const VLCPluginPath = path.join(WebChimeraJs.path, "plugins")
    console.info("win32 detected, VLC_PLUGIN_PATH:", VLCPluginPath)
    process.env["VLC_PLUGIN_PATH"] = VLCPluginPath
  }

  Store.initRenderer()
  const display = screen.getPrimaryDisplay()
  // store/bounds定義を引っ張ってくると目に見えて容量が増えるので決め打ち
  const store = new Store<{}>({
    // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    projectName: pkg.name,
  })
  const bounds: Rectangle | null = store.get(`${pkg.name}.mainPlayer.bounds`)
  const width = bounds?.width || Math.ceil(1280 / display.scaleFactor)
  const height = bounds?.height || Math.ceil(720 / display.scaleFactor)
  window = new BrowserWindow({
    width,
    height,
    x: bounds?.x,
    y: bounds?.y,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: "#111827",
  })

  window.loadFile("index.html", { hash: "MainPlayer" })
  if (process.env.NODE_ENV === "development") {
    window.webContents.openDevTools()
  }
  window.setAspectRatio(16 / 9)
  const [, contentHeight] = window.getContentSize()
  const headerSize = height - contentHeight
  const minWidth = Math.ceil(640 / display.scaleFactor)
  const minHeight =
    Math.ceil(360 / display.scaleFactor) +
    Math.ceil(headerSize / display.scaleFactor)
  window.setMinimumSize(minWidth, minHeight)
  window.setSize(width, height + headerSize)
  const [xPos, yPos] = window.getPosition()
  window.setPosition(xPos, yPos - headerSize)

  window.on("closed", () => {
    window = null
  })
}

app.on("ready", () => init())

app.allowRendererProcessReuse = false

app.on("window-all-closed", () => app.quit())

const reloadTargetPaths = [
  path.resolve(__dirname, "../index.html"),
  path.resolve(__dirname, "dist/src/index.electron.js"),
  path.resolve(__dirname, "main.js"),
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
