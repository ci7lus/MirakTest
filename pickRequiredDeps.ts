/**
 * MIT License
 * Copyright 2021 ci7lus
 */

import fs from "fs"
import * as yarn from "@yarnpkg/lockfile"
import pkg from "./package.json"

type Package = {
  version: string
  resolved: string
  integrity: string
  dependencies?: { [key: string]: string }
}

const targets = [
  "webchimera.js",
  "electron-store",
  "esm",
  "font-list",
  "axios",
  "zod",
  "stream-json",
] as const
const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
const targetWithVersion = targets.map(
  (depName) => `${depName}@${dependencies[depName]}`
)
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
targetWithVersion.forEach((target) => {
  deps.push(target.split("@")[0])
  deps_dedupe.push(target)
  packages[target] && pickPackage(packages[target])
})
deps.map((dep) => console.info(`  - "node_modules/${dep}"`))
console.info(`count: ${deps.length}`)
