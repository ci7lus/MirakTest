import { remote } from "electron"
import { globalContentPlayerPlayingContentFamily } from "./globalFamilies"

const window = remote.getCurrentWindow()

export const contentPlayerPlayingContentAtom =
  globalContentPlayerPlayingContentFamily(window.id)
