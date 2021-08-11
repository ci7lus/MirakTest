import RPC from "discord-rpc"
import React, { useEffect, useRef, useState } from "react"
import { useRecoilValue } from "recoil"
import { globalPresenceAtom } from "../../atoms/global"
import { experimentalSetting } from "../../atoms/settings"

export const CoiledRPCManager: React.VFC<{}> = () => {
  const presence = useRecoilValue(globalPresenceAtom)
  const clientId = "828277784396824596"
  const rpcRef = useRef<RPC.Client | null>(null)
  const [isReady, setIsReady] = useState(false)
  const experimental = useRecoilValue(experimentalSetting)

  useEffect(() => {
    if (!isReady) return
    const rpc = rpcRef.current
    if (!rpc) return
    if (presence && experimental.isRichPresenceEnabled) {
      rpc.setActivity(presence)
    } else {
      rpc.clearActivity()
    }
  }, [isReady, presence, rpcRef.current, experimental])

  useEffect(() => {
    let rpc: RPC.Client | null = null
    try {
      RPC.register(clientId)
      rpc = new RPC.Client({ transport: "ipc" })
      rpc.on("ready", () => setIsReady(true))
      rpc.login({ clientId })
      rpcRef.current = rpc
    } catch {}
    if (!rpc) return
    return () => {
      rpc?.destroy()
    }
  }, [])

  return <></>
}
