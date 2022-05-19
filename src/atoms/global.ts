import { atom } from "recoil"
import pkg from "../../package.json"
import {
  RECOIL_SHARED_ATOM_KEYS,
  RECOIL_STORED_ATOM_KEYS,
} from "../constants/recoil"
import {
  globalActiveContentPlayerIdAtomKey,
  globalContentPlayerIdsAtomKey,
  globalLastEpgUpdatedAtomKey,
  globalDisabledPluginFileNamesAtomKey,
} from "./globalKeys"

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

export const globalContentPlayerIdsAtom = atom<number[]>({
  key: globalContentPlayerIdsAtomKey,
  default: [],
})

export const globalFontsAtom = atom<string[]>({
  key: `${prefix}.fonts`,
  default: [],
})

export const globalLastEpgUpdatedAtom = atom<number>({
  key: globalLastEpgUpdatedAtomKey,
  default: 0,
})

export const globalDisabledPluginFileNamesAtom = atom<string[]>({
  key: globalDisabledPluginFileNamesAtomKey,
  default: [],
})
