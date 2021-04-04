/**
 * MIT License
 * Copyright 2021 ci7lus
 */

import * as yarn from "@yarnpkg/lockfile"
import fs from "fs"

type Package = {
  version: string
  resolved: string
  integrity: string
  dependencies?: { [key: string]: string }
}

const targets = [
  "webchimera.js@^0.3.1",
  "electron-store@^7.0.2",
  "discord-rpc@^3.2.0",
]
const file = fs.readFileSync("yarn.lock", "utf8")
const lock = yarn.parse(file)
if (lock.type !== "success") throw new Error(lock.type)
const deps: string[] = []
const deps_dedupe: string[] = []
const packages = lock.object as {
  [key: string]: Package
}
const pickPackage = (dep: Package) => {
  Object.entries(dep.dependencies || {}).map(([packageName, version]) => {
    const key = `${packageName}@${version}`
    if (!deps_dedupe.includes(key)) {
      deps.push(packageName)
      deps_dedupe.push(key)
      packages[key] && pickPackage(packages[key])
    }
  })
}
targets.map((target) => {
  deps.push(target.split("@")[0])
  deps_dedupe.push(target)
  packages[target] && pickPackage(packages[target])
})
deps.map((dep) => console.log(`  - "node_modules/${dep}"`))
console.log(`count: ${deps.length}`)
