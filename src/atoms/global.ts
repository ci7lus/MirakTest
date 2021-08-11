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
export const globalPresenceAtom = atom<Presence | null>({
  key: `${prefix}.presence`,
  default: null,
})

export const globalSharedAtomsAtom = atom<string[]>({
  key: `${prefix}.sharedAtoms`,
  default: RECOIL_SHARED_ATOM_KEYS,
})

export const globalStoredAtomsAtom = atom<string[]>({
  key: `${prefix}.storedAtoms`,
  default: RECOIL_STORED_ATOM_KEYS,
})
