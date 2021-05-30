import React, { useEffect, useState } from "react"
import { ipcRenderer } from "electron"
import type { Presence } from "discord-rpc"
import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  mainPlayerSelectedService,
  mainPlayerCurrentProgram,
  mainPlayerTitle,
  mainPlayerIsPlaying,
} from "../../atoms/mainPlayer"
import { mirakurunProgramsFamily } from "../../atoms/mirakurun"
import { useNow } from "../../hooks/date"
import { Program } from "../../infra/mirakurun/api"
import { getCurrentProgramOfService } from "../../utils/program"
import { getServiceLogoForPresence } from "../../utils/presence"
import { experimentalSetting } from "../../atoms/settings"
import pkg from "../../../package.json"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const selectedService = useRecoilValue(mainPlayerSelectedService)
  const now = useNow()
  const programs = useRecoilValue(
    mirakurunProgramsFamily(selectedService?.serviceId ?? 0)
  )
  const setCurrentProgram = useSetRecoilState(mainPlayerCurrentProgram)
  const setTitle = useSetRecoilState(mainPlayerTitle)
  const experimental = useRecoilValue(experimentalSetting)

  const isPlaying = useRecoilValue(mainPlayerIsPlaying)

  const [program, setProgram] = useState<Program | null>()

  useEffect(() => {
    if (!selectedService || !isPlaying) {
      setTitle(null)
      ipcRenderer.send("rich-presence", null)
      return
    }
    const currentProgram = getCurrentProgramOfService({
      programs,
      serviceId: selectedService.serviceId,
      now,
    })
    setProgram(currentProgram || null)
    let title = selectedService.name
    const version = `${pkg.productName} ${pkg.version}`
    const logo = getServiceLogoForPresence(selectedService)
    const largeImageKey = logo || "miraktest_icon"
    const smallImageKey = logo ? "miraktest_icon" : undefined
    const largeImageText = logo ? selectedService.name : version
    const smallImageText = logo ? version : undefined
    if (currentProgram) {
      setCurrentProgram(currentProgram)
      if (currentProgram.name) {
        title = `${currentProgram.name} - ${selectedService.name}`
      }
      const activity: Presence = {
        largeImageKey,
        largeImageText,
        smallImageKey,
        smallImageText,
        details: selectedService.name,
        state: currentProgram.name,
        startTimestamp: currentProgram.startAt / 1000,
        endTimestamp: (currentProgram.startAt + currentProgram.duration) / 1000,
        instance: false,
      }
      if (experimental.isRichPresenceEnabled) {
        ipcRenderer.send("rich-presence", activity)
      }
    } else {
      setCurrentProgram(null)
      const activity: Presence = {
        largeImageKey,
        largeImageText,
        smallImageKey,
        smallImageText,
        details: selectedService.name,
        instance: false,
      }
      if (experimental.isRichPresenceEnabled) {
        ipcRenderer.send("rich-presence", activity)
      }
    }
    if (experimental.isRichPresenceEnabled === false) {
      ipcRenderer.send("rich-presence", null)
    }
    setTitle(title)
  }, [programs, selectedService, now, isPlaying, experimental])

  useEffect(() => {
    if (!program) return
    console.log("放送中の番組:", program)
  }, [program])

  return <></>
}
