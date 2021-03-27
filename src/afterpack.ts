import path from "path"
import fs from "fs"
import child from "child_process"
import type { Arch, Target, Packager } from "electron-builder"

// https://www.electron.build/configuration/configuration#afterpack
interface AfterPackContext {
  outDir: string
  appOutDir: string
  packager: Packager
  electronPlatformName: string
  arch: Arch
  targets: Array<Target>
}

exports.default = async (ctx: AfterPackContext) => {
  if (ctx.electronPlatformName === "darwin") {
    const src = path.resolve("./node_modules/webchimera.js/lib")
    const dest = path.resolve("./build/mac/MirakTest.app/Contents/Frameworks")

    if (!fs.existsSync(src) || !fs.existsSync(dest)) {
      console.log("ファイルが存在しません、スキップします")
      return
    }
    console.log("webchimera lib を Contents/Frameworks にコピーします")
    await new Promise((res, rej) => {
      child.exec(`cp -r ${src} ${dest}`, (err, std) => {
        if (err) rej(err)
        res(std)
      })
    })
  }
}