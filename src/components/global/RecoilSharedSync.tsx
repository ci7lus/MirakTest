import React, { useEffect, useRef } from "react"
import type { SerializableParam } from "recoil"
import { DefaultValue } from "recoil"
import { useRecoilSync } from "recoil-sync"
import { RECOIL_SYNC_SHARED_KEY } from "../../constants/recoil"
import { SerializableKV } from "../../types/ipc"
import { ObjectLiteral } from "../../types/struct"

export const RecoilSharedSync: React.FC<{ initialStates: ObjectLiteral }> = ({
  initialStates,
}) => {
  const eventRef = useRef(new EventTarget())
  const eventName = "recoil-shared-sync-from-main"
  const statesRef = useRef(new Map(Object.entries(initialStates)))
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("recoil-sync")
    broadcastChannelRef.current = broadcastChannel
    return () => {
      broadcastChannelRef.current = null
      broadcastChannel.close()
    }
  }, [])
  useRecoilSync({
    storeKey: RECOIL_SYNC_SHARED_KEY,
    read: (key) => {
      const state = statesRef.current
      if (!state.has(key)) {
        return new DefaultValue()
      }
      return state.get(key)
    },
    write: ({ diff }) => {
      broadcastChannelRef.current?.postMessage(diff)
      for (const [key, value] of diff.entries()) {
        window.Preload.recoilStateUpdate({
          key,
          value: value as SerializableParam,
        })
        statesRef.current.set(key, value)
      }
    },
    listen: ({ updateItem }) => {
      const broadcastChannel = broadcastChannelRef.current
      if (!broadcastChannel) {
        return
      }
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
      eventRef.current.addEventListener(eventName, onPayloadFromMain)
      return () => {
        eventRef.current.removeEventListener(eventName, onPayloadFromMain)
        broadcastChannel.removeEventListener("message", listener)
      }
    },
  })
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
  return null
}
