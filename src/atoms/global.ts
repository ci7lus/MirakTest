import { atom } from "recoil"
import pkg from "../../package.json"
import {
  RECOIL_SHARED_ATOM_KEYS,
  RECOIL_STORED_ATOM_KEYS,
} from "../constants/recoil"
import { globalActiveContentPlayerIdAtomKey } from "./globalKeys"

const prefix = `${pkg.name}.global`

export const globalSharedAtomsAtom = atom<string[]>({
  key: `${prefix}.sharedAtoms`,
  default: RECOIL_SHARED_ATOM_KEYS,
})

export const globalStoredAtomsAtom = atom<string[]>({
  key: `${prefix}.storedAtoms`,
  default: RECOIL_STORED_ATOM_KEYS,
})

export const globalActiveContentPlayerIdAtom = atom<number | null>({
  key: globalActiveContentPlayerIdAtomKey,
  default: null,
})
