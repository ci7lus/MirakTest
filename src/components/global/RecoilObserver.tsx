import React from "react"
import { useRecoilTransactionObserver_UNSTABLE } from "recoil"
import {
  mainPlayerBounds,
  mainPlayerLastSelectedServiceId,
  mainPlayerVolume,
} from "../../atoms/mainPlayer"
import { mirakurunSetting, sayaSetting } from "../../atoms/settings"
import { store } from "../../utils/store"

export const RecoilObserver: React.VFC<{}> = () => {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (let atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
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
        case mainPlayerVolume.key:
          try {
            const snap = snapshot.getLoadable(mainPlayerVolume).getValue()
            store.set(mainPlayerVolume.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case mainPlayerBounds.key:
          try {
            const snap = snapshot.getLoadable(mainPlayerBounds).getValue()
            store.set(mainPlayerBounds.key, snap)
          } catch (e) {
            console.error(e)
          }
          break
        case mainPlayerLastSelectedServiceId.key:
          try {
            const snap = snapshot
              .getLoadable(mainPlayerLastSelectedServiceId)
              .getValue()
            store.set(mainPlayerLastSelectedServiceId.key, snap)
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
