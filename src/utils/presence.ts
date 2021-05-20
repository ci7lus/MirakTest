import type { Service } from "../infra/mirakurun/api"

export const PresenceRegisteredBSLogos = [
  101, 103, 141, 151, 161, 171, 211, 222,
]

export const getServiceLogoForPresence = (service: Service) => {
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
