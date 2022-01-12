import React, { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { contentPlayerTitleAtom } from "../../atoms/contentPlayer"
import {
  contentPlayerProgramSelector,
  contentPlayerServiceSelector,
} from "../../atoms/contentPlayerSelectors"
import { convertVariationSelectedClosed } from "../../utils/enclosed"

export const CoiledProgramTitleManager: React.VFC<{}> = () => {
  const service = useRecoilValue(contentPlayerServiceSelector)
  const program = useRecoilValue(contentPlayerProgramSelector)
  const setTitle = useSetRecoilState(contentPlayerTitleAtom)

  useEffect(() => {
    const title = [program?.name, service?.name].filter((s) => s).join(" - ")
    const variationSelected = convertVariationSelectedClosed(title).trim()
    setTitle(variationSelected || null)
  }, [program, service])

  useEffect(() => {
    if (!program) return
    console.info("放送中の番組:", program)
  }, [program])

  return <></>
}
