import { atom } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import pkg from "../../package.json"
import {
  RECOIL_SYNC_SHARED_KEY,
  RECOIL_SYNC_STORED_KEY,
} from "../constants/recoil"
import {
  globalActiveContentPlayerIdAtomKey,
  globalContentPlayerIdsAtomKey,
  globalLastEpgUpdatedAtomKey,
  globalDisabledPluginFileNamesAtomKey,
} from "./globalKeys"

const prefix = `${pkg.name}.global`

export const globalActiveContentPlayerIdAtom = atom<number | null>({
  key: globalActiveContentPlayerIdAtomKey,
  default: null,
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.nullable($.number()),
    }),
  ],
})

export const globalContentPlayerIdsAtom = atom<number[]>({
  key: globalContentPlayerIdsAtomKey,
  default: [],
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.array($.number()),
    }),
  ],
})

export const globalFontsAtom = atom<string[]>({
  key: `${prefix}.fonts`,
  default: [],
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.array($.string()),
    }),
  ],
})

export const globalLastEpgUpdatedAtom = atom<number>({
  key: globalLastEpgUpdatedAtomKey,
  default: 0,
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.number(),
    }),
  ],
})

const globalDisabledPluginFileNamesAtomRefine = $.array($.string())

export const globalDisabledPluginFileNamesAtom = atom<string[]>({
  key: globalDisabledPluginFileNamesAtomKey,
  default: [],
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: globalDisabledPluginFileNamesAtomRefine,
    }),
    syncEffect({
      storeKey: RECOIL_SYNC_STORED_KEY,
      refine: globalDisabledPluginFileNamesAtomRefine,
    }),
  ],
})
