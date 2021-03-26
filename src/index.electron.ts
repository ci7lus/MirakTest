import { app, BrowserWindow, screen } from "electron"
import path from "path"
import Store from "electron-store"

let window: BrowserWindow | null = null

const init = () => {
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

app.on("window-all-closed", () => app.quit())

try {
  require("electron-reload")(
    [path.resolve(__dirname, "index.html"), path.resolve(__dirname, "dist/")],
    {
      electron: process.execPath,
    }
  )
} catch (e) {
  console.error(e)
}
