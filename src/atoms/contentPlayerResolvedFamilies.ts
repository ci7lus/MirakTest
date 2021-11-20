import { remoteWindow } from "../utils/remote"
import {
  globalContentPlayerPlayingContentFamily,
  globalContentPlayerSelectedServiceFamily,
} from "./globalFamilies"

export const contentPlayerPlayingContentAtom =
  globalContentPlayerPlayingContentFamily(remoteWindow.id)

export const contentPlayerSelectedServiceAtom =
  globalContentPlayerSelectedServiceFamily(remoteWindow.id)
