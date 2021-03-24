import { MutableSnapshot } from "recoil"
import {
  mainPlayerBounds,
  mainPlayerLastSelectedServiceId,
  mainPlayerVolume,
} from "../atoms/mainPlayer"
import { mirakurunSetting, sayaSetting } from "../atoms/settings"
import { store } from "./store"

export const initializeState = (mutableSnapShot: MutableSnapshot) => {
  const savedMirakurunSetting = store.get(mirakurunSetting.key, null)
  if (savedMirakurunSetting) {
    mutableSnapShot.set(mirakurunSetting, savedMirakurunSetting)
  }
  const savedSayaSetting = store.get(sayaSetting.key, null)
  if (savedSayaSetting) {
    mutableSnapShot.set(sayaSetting, savedSayaSetting)
  }
  const savedMainPlayerVolume = store.get(mainPlayerVolume.key, null)
  if (savedMainPlayerVolume !== null) {
    mutableSnapShot.set(mainPlayerVolume, savedMainPlayerVolume)
  }
  const savedMainPlayerBounds = store.get(mainPlayerBounds.key, null)
  if (savedMainPlayerBounds) {
    mutableSnapShot.set(mainPlayerBounds, savedMainPlayerBounds)
  }
  const savedMainPlayerLastSelectedServiceId = store.get(
    mainPlayerLastSelectedServiceId.key,
    null
  )
  if (savedMainPlayerLastSelectedServiceId) {
    mutableSnapShot.set(
      mainPlayerLastSelectedServiceId,
      savedMainPlayerLastSelectedServiceId
    )
  }
}
