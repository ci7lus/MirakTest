import { atom } from "recoil"
import pkg from "../../package.json"
import { Program, Service } from "../infra/mirakurun/api"

const prefix = `${pkg.name}.mirakurun`

export const mirakurunCompatibility = atom<"Mirakurun" | "Mirakc" | null>({
  key: `${prefix}.compatibility`,
  default: null,
})

export const mirakurunVersion = atom<string | null>({
  key: `${prefix}.version`,
  default: null,
})

export const mirakurunServices = atom<Service[] | null>({
  key: `${prefix}.services`,
  default: null,
})

export const mirakurunPrograms = atom<Program[] | null>({
  key: `${prefix}.programs`,
  default: null,
})
