/**
 * MIT License
 * Copyright 2021 ci7lus
 */

import fs from "fs"
import yaml from "yaml"
import pkg from "./package.json"

type Package = {
  version: string
  resolution: string
  dependencies: { [version: string]: string }
}

const excludes = ["cmake-js"]
const targets = ["font-list", "electron-store"] as const
const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
const targetWithVersion = targets.map(
  (depName) => `${depName}@npm:${dependencies[depName]}`
)
const file = fs.readFileSync("yarn.lock", "utf8")
const lock: { [key: string]: Package } = yaml.parse(file)
const packages = Object.fromEntries(
  Object.entries(lock)
    .map(([key, value]) => key.split(",").map((key) => [key.trim(), value]))
    .flat()
)
const deps: string[] = []
const deps_dedupe: string[] = []
const pickPackage = (dep: Package) => {
  Object.entries(dep.dependencies || {}).map(([packageName, version]) => {
    const key = `${packageName}@npm:${version}`
    if (!deps_dedupe.includes(key) && !excludes.includes(packageName)) {
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
