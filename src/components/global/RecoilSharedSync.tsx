import React, { useEffect, useRef, useState } from "react"
import type { SerializableParam } from "recoil"
import { DefaultValue } from "recoil"
import { RecoilSync } from "recoil-sync"
import { RECOIL_SYNC_SHARED_KEY } from "../../constants/recoil"
import { SerializableKV } from "../../types/ipc"
import { ObjectLiteral } from "../../types/struct"

export const RecoilSharedSync: React.FC<{
  initialStates: ObjectLiteral
  children?: React.ReactNode
}> = ({ initialStates, children }) => {
  const eventRef = useRef(new EventTarget())
  const eventName = "recoil-shared-sync-from-main"
  const statesRef = useRef(new Map(Object.entries(initialStates)))
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null)
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("recoil-sync")
    setBroadcastChannel(broadcastChannel)
    return () => {
      setBroadcastChannel(null)
      broadcastChannel.close()
    }
  }, [])
  useEffect(() => {
    const onPayloadFromMain = (payload: SerializableKV) =>
      eventRef.current.dispatchEvent(
        new CustomEvent(eventName, {
          detail: payload,
        })
      )
    const off = window.Preload.onRecoilStateUpdate(onPayloadFromMain)
    return () => off()
  }, [])
  return broadcastChannel ? (
    <RecoilSync
      storeKey={RECOIL_SYNC_SHARED_KEY}
      read={(key) => {
        const value = statesRef.current.get(key)
        if (typeof value === "undefined" || value === null) {
          return new DefaultValue()
        }
        return value
      }}
      write={({ diff }) => {
        broadcastChannel.postMessage(diff)
        for (const [key, value] of diff.entries()) {
          window.Preload.recoilStateUpdate({
            key,
            value: value as SerializableParam,
          })
          statesRef.current.set(key, value)
        }
      }}
      listen={({ updateItem }) => {
        const listener = (event: MessageEvent<Map<string, unknown>>) => {
          for (const [key, value] of event.data.entries()) {
            updateItem(key, value)
          }
        }
        broadcastChannel.addEventListener("message", listener)
        const onPayloadFromMain = (event: Event) => {
          const { key, value } = (event as CustomEvent).detail
          updateItem(key, value)
        }
        const event = eventRef.current
        event.addEventListener(eventName, onPayloadFromMain)
        return () => {
          event.removeEventListener(eventName, onPayloadFromMain)
          broadcastChannel.removeEventListener("message", listener)
        }
      }}
      children={children}
    />
  ) : null
}
