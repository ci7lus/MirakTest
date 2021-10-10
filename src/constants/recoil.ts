import {
  contentPlayerBoundsAtom,
  contentPlayerKeyForRestorationAtom,
  contentPlayerVolumeAtom,
} from "../atoms/contentPlayer"
import { globalContentPlayerPlayingContentFamilyKey } from "../atoms/globalFamilyKeys"
import { globalActiveContentPlayerIdAtomKey } from "../atoms/globalKeys"
import { mirakurunServicesAtom } from "../atoms/mirakurun"
import {
  controllerSetting,
  experimentalSetting,
  mirakurunSetting,
  mirakurunUrlHistory,
  screenshotSetting,
} from "../atoms/settings"

export const RECOIL_SHARED_ATOM_KEYS = [
  mirakurunSetting.key,
  controllerSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  mirakurunServicesAtom.key,
  globalActiveContentPlayerIdAtomKey,
  globalContentPlayerPlayingContentFamilyKey,
]

export const RECOIL_STORED_ATOM_KEYS = [
  mirakurunSetting.key,
  mirakurunUrlHistory.key,
  controllerSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  contentPlayerVolumeAtom.key,
  contentPlayerKeyForRestorationAtom.key,
  contentPlayerBoundsAtom.key,
]
