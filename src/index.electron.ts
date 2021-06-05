import { app, BrowserWindow, screen } from "electron"
import path from "path"
import Store from "electron-store"
import WebChimeraJs from "webchimera.js"

let window: BrowserWindow | null = null

const init = () => {
  if (process.platform == "win32" && WebChimeraJs.path) {
    const VLCPluginPath = path.join(WebChimeraJs.path, "plugins")
    console.log("win32 detected, VLC_PLUGIN_PATH:", VLCPluginPath)
    process.env["VLC_PLUGIN_PATH"] = VLCPluginPath
  }

  Store.initRenderer()
  const display = screen.getPrimaryDisplay()
  window = new BrowserWindow({
    width: Math.ceil(1280 / display.scaleFactor),
    height: Math.ceil(720 / display.scaleFactor),
    minWidth: Math.ceil(640 / display.scaleFactor),
    minHeight:
      Math.ceil(360 / display.scaleFactor) +
      Math.ceil(22 / display.scaleFactor),
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

  window.on("closed", () => {
    window = null
  })
}

app.on("ready", () => init())

app.allowRendererProcessReuse = false

app.on("window-all-closed", () => app.quit())

const reloadTargetPaths = [
  path.resolve(__dirname, "../index.html"),
  path.resolve(__dirname, "index.electron.js"),
  path.resolve(__dirname, "main.js"),
]

if (!require.main?.filename.includes("app.asar")) {
  try {
    require("electron-reload")(reloadTargetPaths, {
      electron: process.execPath,
    })
    console.log("electron-reload enabled")
  } catch (e) {
    console.error(e)
  }
}
