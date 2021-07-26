import { useEffect, useRef } from "react"
import { MutableSnapshot, RecoilState, useRecoilValue } from "recoil"
import {
  contentPlayerBounds,
  contentPlayerLastSelectedServiceId,
  contentPlayerVolume,
} from "../atoms/contentPlayer"
import {
  controllerSetting,
  experimentalSetting,
  mirakurunSetting,
  sayaSetting,
  screenshotSetting,
} from "../atoms/settings"
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
  const savedControllerSetting = store.get(controllerSetting.key, null)
  if (savedControllerSetting) {
    mutableSnapShot.set(controllerSetting, savedControllerSetting)
  }
  const savedScreenshotSetting = store.get(screenshotSetting.key, null)
  if (savedScreenshotSetting) {
    mutableSnapShot.set(screenshotSetting, savedScreenshotSetting)
  }
  const savedExperimentalSetting = store.get(experimentalSetting.key, null)
  if (savedExperimentalSetting) {
    mutableSnapShot.set(experimentalSetting, savedExperimentalSetting)
  }
  const savedContentPlayerVolume = store.get(contentPlayerVolume.key, null)
  if (savedContentPlayerVolume !== null) {
    mutableSnapShot.set(contentPlayerVolume, savedContentPlayerVolume)
  }
  const savedContentPlayerBounds = store.get(contentPlayerBounds.key, null)
  if (savedContentPlayerBounds) {
    mutableSnapShot.set(contentPlayerBounds, savedContentPlayerBounds)
  }
  const savedContentPlayerLastSelectedServiceId = store.get(
    contentPlayerLastSelectedServiceId.key,
    null
  )
  if (savedContentPlayerLastSelectedServiceId) {
    mutableSnapShot.set(
      contentPlayerLastSelectedServiceId,
      savedContentPlayerLastSelectedServiceId
    )
  }
}

export const useRecoilValueRef = <T>(s: RecoilState<T>) => {
  const value = useRecoilValue(s)
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return [value, ref] as const
}
