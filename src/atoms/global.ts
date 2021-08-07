import type { Presence } from "discord-rpc"
import { atom } from "recoil"
import pkg from "../../package.json"
import {
  RECOIL_SHARED_ATOM_KEYS,
  RECOIL_STORED_ATOM_KEYS,
} from "../constants/recoil"

const prefix = `${pkg.name}.global`

/**
 * @deprecated
 */
export const globalPresence = atom<Presence | null>({
  key: `${prefix}.presence`,
  default: null,
})

export const globalSharedAtoms = atom<string[]>({
  key: `${prefix}.sharedAtoms`,
  default: RECOIL_SHARED_ATOM_KEYS,
})

export const globalStoredAtoms = atom<string[]>({
  key: `${prefix}.storedAtoms`,
  default: RECOIL_STORED_ATOM_KEYS,
})
