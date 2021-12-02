import { selector } from "recoil"
import pkg from "../../package.json"
import { Service } from "../infra/mirakurun/api"
import { MirakurunCompatibilityTypes } from "../types/mirakurun"
import {
  mirakurunCompatibilityAtom,
  mirakurunServicesAtom,
  mirakurunVersionAtom,
} from "./mirakurun"

const prefix = `${pkg.name}.mirakurun`

export const mirakurunCompatibilitySelector =
  selector<MirakurunCompatibilityTypes | null>({
    key: `${prefix}.compatibilitySelector`,
    get: ({ get }) => {
      return get(mirakurunCompatibilityAtom)
    },
  })

export const mirakurunVersionSelector = selector<string | null>({
  key: `${prefix}.versionSelector`,
  get: ({ get }) => {
    return get(mirakurunVersionAtom)
  },
})

export const mirakurunServicesSelector = selector<Service[] | null>({
  key: `${prefix}.servicesSelector`,
  get: ({ get }) => {
    return get(mirakurunServicesAtom)
  },
})
