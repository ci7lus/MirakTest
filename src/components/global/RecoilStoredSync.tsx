import React, { useRef } from "react"
import { DefaultValue } from "recoil"
import { useRecoilSync } from "recoil-sync"
import { RECOIL_SYNC_STORED_KEY } from "../../constants/recoil"

export const RecoilStoredSync: React.FC<{}> = () => {
  const mapRef = useRef(new Map())
  useRecoilSync({
    storeKey: RECOIL_SYNC_STORED_KEY,
    read: (key) => {
      const map = mapRef.current
      if (map.has(key)) {
        return map.get(key)
      }
      const value = window.Preload.store.get(key)
      if (typeof value === "undefined") {
        return new DefaultValue()
      }
      map.set(key, value)
      return value
    },
    write: ({ diff }) => {
      for (const [key, value] of diff.entries()) {
        mapRef.current.set(key, value)
        if (typeof value === "undefined") {
          window.Preload.store.delete(key)
        } else {
          window.Preload.store.set(key, value)
        }
      }
    },
  })
  return null
}
