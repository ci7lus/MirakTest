import Store from "electron-store"
import pkg from "../../package.json"
import {
  mainPlayerBounds,
  mainPlayerLastSelectedServiceId,
  mainPlayerVolume,
} from "../atoms/mainPlayer"
import { mirakurunSetting, sayaSetting } from "../atoms/settings"

const store = new Store<{}>({
  // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  projectName: pkg.name,
  [mirakurunSetting.key]: {
    baseUrl: { type: "string" },
  },
  [sayaSetting.key]: {
    baseUrl: { type: "string" },
    replaces: { type: "array" },
  },
  [mainPlayerVolume.key]: { type: "number" },
  [mainPlayerBounds.key]: {
    width: { type: "number" },
    height: { type: "number" },
    x: { type: "number" },
    y: { type: "number" },
  },
  [mainPlayerLastSelectedServiceId.key]: { type: "number" },
})

export { store }
