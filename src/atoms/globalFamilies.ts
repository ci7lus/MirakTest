import { atomFamily } from "recoil"

import { ContentPlayerPlayingContent } from "../types/contentPlayer"
import { globalContentPlayerPlayingContentFamilyKey } from "./globalFamilyKeys"

export const globalContentPlayerPlayingContentFamily = atomFamily<
  ContentPlayerPlayingContent | null,
  number
>({
  key: globalContentPlayerPlayingContentFamilyKey,
  default: null,
})
