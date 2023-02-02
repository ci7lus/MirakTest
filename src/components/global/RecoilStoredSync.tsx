import React, { useRef } from "react"
import { DefaultValue } from "recoil"
import { RecoilSync } from "recoil-sync"
import { RECOIL_SYNC_STORED_KEY } from "../../constants/recoil"

export const RecoilStoredSync: React.FC<{ children?: React.ReactElement }> = ({
  children,
}) => {
  const mapRef = useRef(new Map())
  return (
    <RecoilSync
      storeKey={RECOIL_SYNC_STORED_KEY}
      read={(key) => {
        const map = mapRef.current
        const value = map.get(key) || window.Preload.store.get(key)
        if (value === undefined) {
          return new DefaultValue()
        }
        map.set(key, value)
        return value
      }}
      write={({ diff }) => {
        for (const [key, value] of diff.entries()) {
          mapRef.current.set(key, value)
          if (value === undefined) {
            window.Preload.store.delete(key)
          } else {
            window.Preload.store.set(key, value)
          }
        }
      }}
      children={children}
    />
  )
}
