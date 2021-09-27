import Store from "electron-store"
import pkg from "../../package.json"
import {
  contentPlayerBoundsAtom,
  contentPlayerKeyForRestorationAtom,
  contentPlayerVolumeAtom,
} from "../atoms/contentPlayer"
import { mirakurunSetting } from "../atoms/settings"

const store = new Store<{}>({
  // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  projectName: pkg.name,
  [mirakurunSetting.key]: {
    baseUrl: { type: "string" },
  },
  [contentPlayerVolumeAtom.key]: { type: "number" },
  [contentPlayerBoundsAtom.key]: {
    width: { type: "number" },
    height: { type: "number" },
    x: { type: "number" },
    y: { type: "number" },
  },
  [contentPlayerKeyForRestorationAtom.key]: { type: "number" },
})

export { store }
