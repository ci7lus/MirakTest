import { Service } from "../infra/mirakurun/api"

export type MirakurunCompatibilityTypes = "Mirakurun" | "Mirakc"

export type ServiceWithLogoData = Service & { logoData?: string }
