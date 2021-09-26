import {
  contentPlayerBoundsAtom,
  contentPlayerKeyForRestorationAtom,
  contentPlayerVolumeAtom,
} from "../atoms/contentPlayer"
import { globalContentPlayerPlayingContentFamilyKey } from "../atoms/globalFamilyKeys"
import { globalActiveContentPlayerIdAtomKey } from "../atoms/globalKeys"
import { mirakurunServices } from "../atoms/mirakurun"
import {
  controllerSetting,
  experimentalSetting,
  mirakurunSetting,
  sayaSetting,
  screenshotSetting,
} from "../atoms/settings"

export const RECOIL_SHARED_ATOM_KEYS = [
  mirakurunSetting.key,
  sayaSetting.key,
  controllerSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  mirakurunServices.key,
  globalActiveContentPlayerIdAtomKey,
  globalContentPlayerPlayingContentFamilyKey,
]

export const RECOIL_STORED_ATOM_KEYS = [
  mirakurunSetting.key,
  sayaSetting.key,
  controllerSetting.key,
  screenshotSetting.key,
  experimentalSetting.key,
  contentPlayerVolumeAtom.key,
  contentPlayerKeyForRestorationAtom.key,
  contentPlayerBoundsAtom.key,
]
