import $ from "@recoiljs/refine"
import { atom } from "recoil"
import { syncEffect } from "recoil-sync"
import pkg from "../../package.json"
import { RECOIL_SYNC_SHARED_KEY } from "../constants/recoil"
import {
  MirakurunCompatibilityTypes,
  ServiceWithLogoData,
} from "../types/mirakurun"

const prefix = `${pkg.name}.mirakurun`

export const mirakurunCompatibilityAtom =
  atom<MirakurunCompatibilityTypes | null>({
    key: `${prefix}.compatibility`,
    default: null,
  })

export const mirakurunVersionAtom = atom<string | null>({
  key: `${prefix}.version`,
  default: null,
})

export const mirakurunServicesAtom = atom<ServiceWithLogoData[] | null>({
  key: `${prefix}.services`,
  default: null,
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.nullable($.array($.mixed())),
    }),
  ],
})
