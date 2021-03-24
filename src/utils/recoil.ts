import { MutableSnapshot } from "recoil"
import { mainPlayerLastSelectedServiceId } from "../atoms/mainPlayer"
import {
  mirakurunSetting,
  mirakurunSettingParser,
  sayaSetting,
  sayaSettingParser,
} from "../atoms/settings"
import { store } from "./store"

export const initializeState = (mutableSnapShot: MutableSnapshot) => {
  const savedMirakurunSetting = store.get(mirakurunSetting.key, null)
  if (savedMirakurunSetting) {
    try {
      const parsed = mirakurunSettingParser.parse(
        JSON.parse(savedMirakurunSetting)
      )
      mutableSnapShot.set(mirakurunSetting, parsed)
    } catch {}
  }
  const savedSayaSetting = store.get(sayaSetting.key, null)
  if (savedSayaSetting) {
    try {
      const parsed = sayaSettingParser.parse(JSON.parse(savedSayaSetting))
      mutableSnapShot.set(sayaSetting, parsed)
    } catch {}
  }
  const savedMainPlayerLastSelectedServiceId = store.get(
    mainPlayerLastSelectedServiceId.key,
    null
  )
  if (savedMainPlayerLastSelectedServiceId) {
    try {
      const parsed = JSON.parse(savedMainPlayerLastSelectedServiceId)
      if (!Number.isNaN(parsed)) {
        mutableSnapShot.set(mainPlayerLastSelectedServiceId, parsed)
      }
    } catch {}
  }
}
