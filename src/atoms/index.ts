import { RecoilState, RecoilValueReadOnly } from "recoil"
import * as contentPlayer from "./contentPlayer"
import * as contentPlayerSelectors from "./contentPlayerSelectors"
import * as global from "./global"
import * as globalFamilies from "./globalFamilies"
import * as globalSelectors from "./globalSelectors"
import * as mirakurun from "./mirakurun"
import * as mirakurunSelectorFamilies from "./mirakurunSelectorFamilies"
import * as settings from "./settings"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_ATOMS: RecoilState<any>[] = [
  ...Object.values(global),
  ...Object.values(contentPlayer),
  ...Object.values(mirakurun),
  ...Object.values(settings),
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_SELECTORS: RecoilValueReadOnly<any>[] = [
  ...Object.values(contentPlayerSelectors),
  ...Object.values(globalSelectors),
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_FAMILIES: ((param: any) => RecoilState<any>)[] = [
  ...Object.values(globalFamilies),
]

export const ALL_SELECTOR_FAMILIES: ((
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  param: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => RecoilValueReadOnly<any>)[] = [...Object.values(mirakurunSelectorFamilies)]
