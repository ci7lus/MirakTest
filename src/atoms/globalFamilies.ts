import { atomFamily } from "recoil"
import { Service } from "../infra/mirakurun/api"

import { ContentPlayerPlayingContent } from "../types/contentPlayer"
import {
  globalContentPlayerPlayingContentFamilyKey,
  globalContentPlayerSelectedServiceFamilyKey,
} from "./globalFamilyKeys"

export const globalContentPlayerPlayingContentFamily = atomFamily<
  ContentPlayerPlayingContent | null,
  number
>({
  key: globalContentPlayerPlayingContentFamilyKey,
  default: null,
})

export const globalContentPlayerSelectedServiceFamily = atomFamily<
  Service | null,
  number
>({
  key: globalContentPlayerSelectedServiceFamilyKey,
  default: null,
})
