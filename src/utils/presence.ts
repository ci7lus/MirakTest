import type { Service } from "../infra/mirakurun/api"

// Reference: https://github.com/SlashNephy/TvTestRPC

export const PresenceRegisteredGRLogos = [
  1040, 1048, 1056, 1064, 1072, 17424, 17432, 17440, 17448, 2064, 2072, 2080,
  2088, 23608, 23672, 24632, 24680, 34840, 37904, 37912, 37920, 38008, 41008,
  43056, 46128, 47528,
]

export const PresenceRegisteredBSLogos = [
  101, 103, 141, 151, 161, 171, 181, 191, 200, 211, 222, 231, 234, 236, 241,
  242, 251, 252, 255, 256,
]

export const PresenceRegisteredCSLogos = [
  161, 218, 219, 223, 227, 240, 250, 254, 257, 262, 290, 292, 293, 294, 295,
  296, 297, 298, 299, 300, 301, 305, 307, 308, 309, 310, 311, 312, 314, 316,
  317, 318, 321, 322, 323, 324, 325, 329, 330, 331, 333, 339, 340, 341, 342,
  343, 349, 351, 353, 354, 363, 55, 800, 801,
]

export const PresenceAliases: { [key: number]: number } = {
  24696: 24680, // イッツコムch11 (CATV)
  531: 231, // 放送大学ラジオ
}

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

  for (const sub of [...Array(4).keys()]) {
    // +4までサブチャンネルとする
    const serviceId =
      PresenceAliases[service.serviceId - sub] ?? service.serviceId - sub
    if (PresenceRegisteredGRLogos.includes(serviceId)) {
      return `gr_${serviceId}`
    }
    if (PresenceRegisteredBSLogos.includes(serviceId)) {
      return `bs_${serviceId}`
    }
    if (PresenceRegisteredCSLogos.includes(serviceId)) {
      return `cs_${serviceId}`
    }
  }
  return false
}
