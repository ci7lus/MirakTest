import type { Presence } from "discord-rpc"
import React, { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../../package.json"
import { contentPlayerTitleAtom } from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
  contentPlayerServiceSelector,
} from "../../atoms/contentPlayerSelectors"
import { globalPresenceAtom } from "../../atoms/global"
import { getServiceLogoForPresence } from "../../utils/presence"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const service = useRecoilValue(contentPlayerServiceSelector)
  const program = useRecoilValue(contentPlayerProgramSelector)
  const setTitle = useSetRecoilState(contentPlayerTitleAtom)
  const setPresence = useSetRecoilState(globalPresenceAtom)

  useEffect(() => {
    if (!service) {
      setTitle(null)
      setPresence(null)
      return
    }
    let title = service.name
    const version = `${pkg.productName} ${pkg.version}`
    const logo = getServiceLogoForPresence(service)
    const largeImageKey = logo || "miraktest_icon"
    const smallImageKey = logo ? "miraktest_icon" : undefined
    const largeImageText = logo ? service.name : version
    const smallImageText = logo ? version : undefined
    if (program) {
      if (program.name) {
        title = `${program.name} - ${service.name}`
      }
      const shiftedExtended =
        program.extended && Object.entries(program.extended).shift()?.join(" ")
      const description = program.description?.trim() || shiftedExtended
      const isDisplayDescription =
        logo && description && 2 <= description.length
      const details = isDisplayDescription ? program.name : service.name
      const state =
        isDisplayDescription && description
          ? 128 < description.length
            ? description.slice(0, 127) + "…"
            : description
          : program.name
      const activity: Presence = {
        largeImageKey,
        largeImageText,
        smallImageKey,
        smallImageText,
        details,
        state,
        startTimestamp: program.startAt / 1000,
        endTimestamp: (program.startAt + program.duration) / 1000,
        instance: false,
      }
      setPresence(activity)
    } else {
      const activity: Presence = {
        largeImageKey,
        largeImageText,
        smallImageKey,
        smallImageText,
        details: service.name,
        instance: false,
      }
      setPresence(activity)
    }
    setTitle(title)
  }, [program, service])

  useEffect(() => {
    if (!program) return
    console.info("放送中の番組:", program)
  }, [program])

  return <></>
}
