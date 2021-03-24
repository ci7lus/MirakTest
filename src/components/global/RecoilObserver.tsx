import React from "react"
import { useRecoilTransactionObserver_UNSTABLE } from "recoil"
import { mainPlayerLastSelectedServiceId } from "../../atoms/mainPlayer"
import {
  mirakurunSetting,
  mirakurunSettingParser,
  sayaSetting,
  sayaSettingParser,
} from "../../atoms/settings"
import { store } from "../../utils/store"

export const RecoilObserver: React.VFC<{}> = () => {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (let atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      switch (atom.key) {
        case mirakurunSetting.key:
          try {
            const snap = snapshot.getLoadable(mirakurunSetting).getValue()
            mirakurunSettingParser.parse(snap)
            store.set(mirakurunSetting.key, JSON.stringify(snap))
          } catch (e) {
            console.error(e)
          }
          break
        case sayaSetting.key:
          try {
            const snap = snapshot.getLoadable(sayaSetting).getValue()
            sayaSettingParser.parse(snap)
            store.set(sayaSetting.key, JSON.stringify(snap))
          } catch (e) {
            console.error(e)
          }
          break
        case mainPlayerLastSelectedServiceId.key:
          try {
            const snap = snapshot
              .getLoadable(mainPlayerLastSelectedServiceId)
              .getValue()
            if (Number.isNaN(snap))
              throw new Error("mainPlayerLastSelectedServiceId NaN")
            store.set(mainPlayerLastSelectedServiceId.key, JSON.stringify(snap))
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
