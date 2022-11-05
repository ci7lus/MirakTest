import $ from "@recoiljs/refine"
import { atomFamily } from "recoil"
import { syncEffect } from "recoil-sync"
import { RECOIL_SYNC_SHARED_KEY } from "../constants/recoil"
import { contentPlayerIsPlayingAtomKey } from "./contentPlayerKeys"

export const contentPlayerIsPlayingFamilyAtom = atomFamily<boolean, number>({
  key: contentPlayerIsPlayingAtomKey,
  default: false,
  effects: [syncEffect({ storeKey: RECOIL_SYNC_SHARED_KEY, refine: $.bool() })],
})
