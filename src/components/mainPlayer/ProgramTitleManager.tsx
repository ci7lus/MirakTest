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
import { mirakurunPrograms } from "../../atoms/mirakurun"
import { useNow } from "../../hooks/date"
import { Program } from "../../infra/mirakurun/api"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const selectedService = useRecoilValue(mainPlayerSelectedService)
  const now = useNow()
  const programs = useRecoilValue(mirakurunPrograms)
  const setCurrentProgram = useSetRecoilState(mainPlayerCurrentProgram)
  const setTitle = useSetRecoilState(mainPlayerTitle)

  const isPlaying = useRecoilValue(mainPlayerIsPlaying)

  const [program, setProgram] = useState<Program | null>()

  useEffect(() => {
    if (!selectedService || !isPlaying) {
      setTitle(null)
      ipcRenderer.send("rich-presence", null)
      return
    }
    const currentProgram = programs?.find(
      (program) =>
        program.serviceId === selectedService.serviceId &&
        now.isAfter(program.startAt) &&
        now.isBefore(program.startAt + program.duration)
    )
    setProgram(currentProgram || null)
    let title = `${selectedService.name}`
    if (currentProgram) {
      setCurrentProgram(currentProgram)
      if (currentProgram.name) {
        title = `${currentProgram.name} - ${selectedService.name}`
      }
      const activity: Presence = {
        largeImageKey: "miraktest_icon",
        details: selectedService.name,
        state: currentProgram.name,
        startTimestamp: currentProgram.startAt / 1000,
        endTimestamp: (currentProgram.startAt + currentProgram.duration) / 1000,
        instance: false,
      }
      ipcRenderer.send("rich-presence", activity)
    } else {
      setCurrentProgram(null)
      const activity: Presence = {
        largeImageKey: "miraktest_icon",
        details: selectedService.name,
        instance: false,
      }
      ipcRenderer.send("rich-presence", activity)
    }
    setTitle(title)
  }, [programs, selectedService, now, isPlaying])

  useEffect(() => {
    if (!program) return
    console.log("放送中の番組:", program)
  }, [program])

  return <></>
}
