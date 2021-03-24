import { atom } from "recoil"
import * as $ from "zod"
import pkg from "../../package.json"
import { MirakurunSetting, SayaSetting } from "../types/struct"

const prefix = `${pkg.name}:settings`

export const mirakurunSetting = atom<MirakurunSetting>({
  key: `${prefix}:mirakurun`,
  default: {
    baseUrl: undefined,
    username: undefined,
    password: undefined,
  },
})

export const mirakurunSettingParser = $.object({
  baseUrl: $.string().optional(),
  username: $.string().optional(),
  password: $.string().optional(),
})

export const sayaSetting = atom<SayaSetting>({
  key: `${prefix}:saya`,
  default: {
    baseUrl: undefined,
    secure: false,
  },
})

export const sayaSettingParser = $.object({
  baseUrl: $.string().optional(),
  secure: $.boolean().optional(),
})
