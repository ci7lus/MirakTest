import type { Presence } from "discord-rpc"
import { atom } from "recoil"
import pkg from "../../package.json"

const prefix = `${pkg.name}.global`

export const globalPresence = atom<Presence | null>({
  key: `${prefix}.presence`,
  default: null,
})
