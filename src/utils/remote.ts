import { remote } from "electron"

export const getWindowByHash = (hash: string) => {
  const windows = remote.BrowserWindow.getAllWindows()
  return windows.find((window) => window.webContents.getURL().includes(hash))
}
