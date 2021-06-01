import { atom } from "recoil"
import pkg from "../../package.json"
import type { Presence } from "discord-rpc"

const prefix = `${pkg.name}.global`

export const globalPresence = atom<Presence | null>({
  key: `${prefix}.presence`,
  default: null,
})
