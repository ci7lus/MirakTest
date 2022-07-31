import { builtinModules } from "module"

const _FORBIDDEN_MODULES = ["child_process", "worker_threads", "vm", "v8"]
export const FORBIDDEN_MODULES = [
  ..._FORBIDDEN_MODULES,
  ..._FORBIDDEN_MODULES.map((mod) => `node:${mod}`),
]
const _ALLOWED_MODULES = ["buffer", "console", "process", "timers"]
export const ALLOWED_MODULES = [
  ..._ALLOWED_MODULES,
  ..._ALLOWED_MODULES.map((mod) => `node:${mod}`),
]
export const BUILTIN_MODULES = [
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
]
