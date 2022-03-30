import {
  contentPlayerBoundsAtom,
  contentPlayerKeyForRestorationAtom,
  contentPlayerSubtitleEnabledAtom,
  contentPlayerVolumeAtom,
} from "../atoms/contentPlayer"
import {
  globalContentPlayerPlayingContentFamilyKey,
  globalContentPlayerSelectedServiceFamilyKey,
} from "../atoms/globalFamilyKeys"
import { globalActiveContentPlayerIdAtomKey } from "../atoms/globalKeys"
import { mirakurunServicesAtom } from "../atoms/mirakurun"
import {
  controllerSetting,
  experimentalSetting,
  mirakurunSetting,
  mirakurunUrlHistory,
  screenshotSetting,
  subtitleSetting,
} from "../atoms/settings"

export const RECOIL_SHARED_ATOM_KEYS = [
  mirakurunSetting.key,
  controllerSetting.key,
  subtitleSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  mirakurunServicesAtom.key,
  globalActiveContentPlayerIdAtomKey,
  globalContentPlayerPlayingContentFamilyKey,
  globalContentPlayerSelectedServiceFamilyKey,
]

export const RECOIL_STORED_ATOM_KEYS = [
  mirakurunSetting.key,
  mirakurunUrlHistory.key,
  controllerSetting.key,
  subtitleSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  contentPlayerVolumeAtom.key,
  contentPlayerKeyForRestorationAtom.key,
  contentPlayerBoundsAtom.key,
  contentPlayerSubtitleEnabledAtom.key,
]
