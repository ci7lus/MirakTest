import React from "react"
import { useRecoilTransactionObserver_UNSTABLE } from "recoil"
import {
  contentPlayerBounds,
  contentPlayerLastSelectedServiceId,
  contentPlayerVolume,
} from "../../atoms/contentPlayer"
import {
  controllerSetting,
  experimentalSetting,
  mirakurunSetting,
  sayaSetting,
  screenshotSetting,
} from "../../atoms/settings"
import { store } from "../../utils/store"

export const RecoilObserver: React.VFC<{}> = () => {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (const atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      switch (atom.key) {
        case mirakurunSetting.key:
          try {
            const snap = snapshot.getLoadable(mirakurunSetting).getValue()
            store.set(mirakurunSetting.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case sayaSetting.key:
          try {
            const snap = snapshot.getLoadable(sayaSetting).getValue()
            store.set(sayaSetting.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case controllerSetting.key:
          try {
            const snap = snapshot.getLoadable(controllerSetting).getValue()
            store.set(controllerSetting.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case screenshotSetting.key:
          try {
            const snap = snapshot.getLoadable(screenshotSetting).getValue()
            store.set(screenshotSetting.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case experimentalSetting.key:
          try {
            const snap = snapshot.getLoadable(experimentalSetting).getValue()
            store.set(experimentalSetting.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case contentPlayerVolume.key:
          try {
            const snap = snapshot.getLoadable(contentPlayerVolume).getValue()
            store.set(contentPlayerVolume.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case contentPlayerBounds.key:
          try {
            const snap = snapshot.getLoadable(contentPlayerBounds).getValue()
            store.set(contentPlayerBounds.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case contentPlayerLastSelectedServiceId.key:
          try {
            const snap = snapshot
              .getLoadable(contentPlayerLastSelectedServiceId)
              .getValue()
            store.set(contentPlayerLastSelectedServiceId.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        default:
          break
      }
    }
  })
  return <></>
}
