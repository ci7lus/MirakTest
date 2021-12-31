import fs from "fs"
import os from "os"
import path from "path"

const homeDir = os.homedir()
export const exists = async (filePath: string) =>
  new Promise<boolean>((res) => {
    fs.promises
      .lstat(filePath)
      .then((stat) => res(stat.isFile() || stat.isDirectory()))
      .catch(() => res(false))
  })
export const isChildOfHome = (filePath: string) => {
  // https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
  const relative = path.relative(homeDir, filePath)
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative)
}
export const isHidden = (filePath: string) => {
  return filePath.split(/\/|\\/).some((part) => part.startsWith("."))
}
