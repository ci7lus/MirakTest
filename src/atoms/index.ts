import { RecoilState, RecoilValueReadOnly } from "recoil"
import * as contentPlayer from "./contentPlayer"
import * as global from "./global"
import * as mirakurun from "./mirakurun"
import * as settings from "./settings"

export const ALL_ATOMS = [
  ...Object.values(global),
  ...Object.values(contentPlayer),
  ...Object.values(mirakurun),
  ...Object.values(settings),
] as (RecoilState<unknown> | RecoilValueReadOnly<unknown>)[]
