import React, { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import ReconnectingWebSocket from "reconnecting-websocket"
import { mainPlayerSelectedService } from "../../atoms/mainPlayer"
import { sayaSetting } from "../../atoms/settings"
import { CommentPayload } from "../../types/struct"
import { DPlayerWrap } from "./DPlayer"

export const SayaComments: React.VFC<{}> = () => {
  const saya = useRecoilValue(sayaSetting)
  const service = useRecoilValue(mainPlayerSelectedService)
  const [comment, setComment] = useState<CommentPayload | null>(null)
  useEffect(() => {
    if (!service || !saya || !saya.baseUrl) return
    let ws: ReconnectingWebSocket
    try {
      const wsUrl = new URL(saya.baseUrl)
      if (saya.secure) {
        wsUrl.protocol = "wss:"
      } else {
        wsUrl.protocol = "ws:"
      }

      ws = new ReconnectingWebSocket(
        `${wsUrl.href}/comments/${service.id}/live`
      )
      ws.addEventListener("message", (e) => {
        const payload: CommentPayload = JSON.parse(e.data)
        setComment(payload)
      })
    } catch (error) {}

    return () => {
      ws?.close()
    }
  }, [service, saya])
  return <DPlayerWrap comment={comment} />
}
