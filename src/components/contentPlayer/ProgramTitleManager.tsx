import type { Presence } from "discord-rpc"
import React, { useEffect, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../../package.json"
import {
  contentPlayerSelectedServiceAtom,
  contentPlayerCurrentProgramAtom,
  contentPlayerTitleAtom,
} from "../../atoms/contentPlayer"
import { globalPresenceAtom } from "../../atoms/global"
import { mirakurunProgramsFamily } from "../../atoms/mirakurunSelectorFamilies"
import { useNow } from "../../hooks/date"
import { Program } from "../../infra/mirakurun/api"
import { getServiceLogoForPresence } from "../../utils/presence"
import { getCurrentProgramOfService } from "../../utils/program"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const selectedService = useRecoilValue(contentPlayerSelectedServiceAtom)
  const now = useNow()
  const programs = useRecoilValue(
    mirakurunProgramsFamily(selectedService?.serviceId ?? 0)
  )
  const setCurrentProgram = useSetRecoilState(contentPlayerCurrentProgramAtom)
  const setTitle = useSetRecoilState(contentPlayerTitleAtom)

  const [program, setProgram] = useState<Program | null>()

  const setPresence = useSetRecoilState(globalPresenceAtom)

  useEffect(() => {
    if (!selectedService) {
      setTitle(null)
      setPresence(null)
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
      const shiftedExtended =
        currentProgram.extended &&
        Object.entries(currentProgram.extended).shift()?.join(" ")
      const description = currentProgram.description?.trim() || shiftedExtended
      const isDisplayDescription =
        logo && description && 2 <= description.length
      const details = isDisplayDescription
        ? currentProgram.name
        : selectedService.name
      const state =
        isDisplayDescription && description
          ? 128 < description.length
            ? description.slice(0, 127) + "…"
            : description
          : currentProgram.name
      const activity: Presence = {
        largeImageKey,
        largeImageText,
        smallImageKey,
        smallImageText,
        details,
        state,
        startTimestamp: currentProgram.startAt / 1000,
        endTimestamp: (currentProgram.startAt + currentProgram.duration) / 1000,
        instance: false,
      }
      setPresence(activity)
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
      setPresence(activity)
    }
    setTitle(title)
  }, [programs, selectedService, now])

  useEffect(() => {
    if (!program) return
    console.info("放送中の番組:", program)
  }, [program])

  return <></>
}
