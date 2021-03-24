import { atom } from "recoil"
import pkg from "../../package.json"
import { MirakurunSetting, SayaSetting } from "../types/struct"

const prefix = `${pkg.name}.settings`

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}.mirakurun`,
  default: {
    baseUrl: undefined,
    username: undefined,
    password: undefined,
  },
})

export const sayaSetting = atom<SayaSetting>({
  key: `${prefix}.saya`,
  default: {
    baseUrl: undefined,
    secure: false,
  },
})
