import { remoteWindow } from "../utils/remote"
import { globalContentPlayerPlayingContentFamily } from "./globalFamilies"

export const contentPlayerPlayingContentAtom =
  globalContentPlayerPlayingContentFamily(remoteWindow.id)
