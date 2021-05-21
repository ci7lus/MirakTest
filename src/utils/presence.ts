import type { Service } from "../infra/mirakurun/api"

export const PresenceRegisteredGRLogos = [
  1040, 1048, 1056, 1064, 1072, 17424, 17432, 17440, 17448, 23608, 24632, 24680,
  34840, 37904, 37912, 37920, 38008,
]

export const PresenceRegisteredBSLogos = [
  101, 103, 141, 151, 161, 171, 181, 191, 200, 211, 222, 231, 234, 236, 241,
  242, 251, 252, 255, 256,
]

export const getServiceLogoForPresence = (service: Service) => {
  if (service.name.includes("ＮＨＫ総合") || service.name.includes("NHK総合")) {
    return "gr_nhkg"
  }
  if (
    service.name.includes("ＮＨＫＥテレ") ||
    service.name.includes("NHKEテレ")
  ) {
    return "gr_nhke"
  }
  for (const sub of [...Array(3).keys()]) {
    // +3までサブチャンネルとする
    const serviceId = service.serviceId - sub
    if (PresenceRegisteredGRLogos.includes(serviceId)) {
      return `gr_${serviceId}`
    }
    if (PresenceRegisteredBSLogos.includes(serviceId)) {
      return `bs_${serviceId}`
    }
  }
  return false
}
