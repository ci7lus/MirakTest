import { Service } from "../infra/mirakurun/api"

export const MirakurunCompatibilityServers = {
  Mirakurun: "Mirakurun",
  Mirakc: "Mirakc",
  Mahiron: "Mahiron",
} as const

export type MirakurunCompatibilityTypes =
  keyof typeof MirakurunCompatibilityServers

export type ServiceWithLogoData = Service & { logoData?: string }
