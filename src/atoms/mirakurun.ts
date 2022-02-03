import { atom } from "recoil"
import pkg from "../../package.json"
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
})
