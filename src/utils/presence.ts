import type { Service } from "../infra/mirakurun/api"

export const PresenceRegisteredGRLogos = [
  1040, 1048, 1056, 1064, 1072, 17424, 17432, 17440, 17448, 23608, 34840, 37904,
  37912, 37920,
]

export const PresenceRegisteredBSLogos = [
  101, 103, 141, 151, 161, 171, 181, 191, 200, 211, 222,
]

export const getServiceLogoForPresence = (service: Service) => {
  if (PresenceRegisteredGRLogos.includes(service.serviceId)) {
    return `gr_${service.serviceId}`
  }
  if (PresenceRegisteredBSLogos.includes(service.serviceId)) {
    return `bs_${service.serviceId}`
  }
  if (service.name.includes("ＮＨＫ総合") || service.name.includes("NHK総合")) {
    return "gr_nhkg"
  }
  if (
    service.name.includes("ＮＨＫＥテレ") ||
    service.name.includes("NHKEテレ")
  ) {
    return "gr_nhke"
  }
  return false
}
