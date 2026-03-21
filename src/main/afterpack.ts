import child from "child_process"
import fs from "fs"
import path from "path"
import { Arch, Target, Packager } from "electron-builder"

// https://www.electron.build/configuration/configuration#afterpack
interface AfterPackContext {
  outDir: string
  appOutDir: string
  packager: Packager
  electronPlatformName: string
  arch: Arch
  targets: Array<Target>
}

const exec = async (command: string) => {
  return await new Promise((res, rej) => {
    child.exec(command, (err, std) => {
      if (err) rej(err)
      res(std)
    })
  })
}

exports.default = async (ctx: AfterPackContext) => {
  console.info(`${ctx.electronPlatformName} 用の変更を適用します`)

  if (ctx.electronPlatformName === "darwin") {
    const appName = ctx.packager.appInfo.productName
    const mpvBin = path.resolve("./mpv_libs/bin/mpv")
    const mpvLibs = path.resolve("./mpv_libs/lib/")
    const appDir = `./build/mac${ctx.arch === Arch.arm64 ? "-arm64" : ""}/${appName}.app`
    const frameworksDest = path.resolve(`${appDir}/Contents/Frameworks/`)
    const macosDest = path.resolve(`${appDir}/Contents/MacOS/`)

    if (!fs.existsSync(mpvBin) || !fs.existsSync(mpvLibs)) {
      console.info("mpv_libs が存在しません、スキップします")
      return
    }

    await exec(`cp "${mpvBin}" "${macosDest}/mpv" && chmod +x "${macosDest}/mpv"`)

    const libFiles = fs.readdirSync(mpvLibs).filter(f => f.endsWith('.dylib'))
    for (const lib of libFiles) {
      await exec(`cp "${path.join(mpvLibs, lib)}" "${frameworksDest}/"`)
    }

    console.log(`[afterpack] Copied mpv binary and ${libFiles.length} dylibs`)
    console.log("[afterpack] Note: mpv and its dependencies (ffmpeg etc.) are bundled under LGPL/GPL")

    if (ctx.arch === Arch.arm64) {
      // aarch64のみappをcodesignしなおす
      console.info("codesignを実行します")
      await exec(`codesign --force --deep -s - -i - ./build/mac-arm64/${appName}.app`)
    }
  }
}
