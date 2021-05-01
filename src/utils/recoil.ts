import { useEffect, useRef } from "react"
import { MutableSnapshot, RecoilState, useRecoilValue } from "recoil"
import {
  mainPlayerBounds,
  mainPlayerLastSelectedServiceId,
  mainPlayerVolume,
} from "../atoms/mainPlayer"
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

export const useRecoilValueRef = <T>(s: RecoilState<T>) => {
  const value = useRecoilValue(s)
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return [value, ref] as const
}
