import React, { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { contentPlayerTitleAtom } from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
  contentPlayerServiceSelector,
} from "../../atoms/contentPlayerSelectors"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const service = useRecoilValue(contentPlayerServiceSelector)
  const program = useRecoilValue(contentPlayerProgramSelector)
  const setTitle = useSetRecoilState(contentPlayerTitleAtom)

  useEffect(() => {
    if (!service) {
      setTitle(null)
      return
    }
    const title = program?.name
      ? `${program.name} - ${service.name}`
      : service.name
    setTitle(title)
  }, [program, service])

  useEffect(() => {
    if (!program) return
    console.info("放送中の番組:", program)
  }, [program])

  return <></>
}
