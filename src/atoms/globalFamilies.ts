import { atomFamily } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import { RECOIL_SYNC_SHARED_KEY } from "../constants/recoil"
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
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.nullable(
        $.object({
          contentType: $.string(),
          url: $.string(),
          program: $.voidable($.mixed()),
          service: $.voidable($.mixed()),
        })
      ),
    }),
  ],
})

export const globalContentPlayerSelectedServiceFamily = atomFamily<
  Service | null,
  number
>({
  key: globalContentPlayerSelectedServiceFamilyKey,
  default: null,
  effects: [
    syncEffect({
      storeKey: RECOIL_SYNC_SHARED_KEY,
      refine: $.nullable($.mixed()),
    }),
  ],
})
