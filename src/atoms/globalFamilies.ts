import { atomFamily } from "recoil"
import pkg from "../../package.json"
import { ContentPlayerPlayingContent } from "../types/contentPlayer"

const prefix = `${pkg.name}.global`

export const contentPlayerPlayingContentAtom = atomFamily<
  ContentPlayerPlayingContent | null,
  number
>({
  key: `${prefix}.playingContent`,
  default: null,
})
