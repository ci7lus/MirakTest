/**
 * Mirakurun
 * DVR Tuner Server Service for Chinachu Air.
 *
 * The version of the OpenAPI document: 3.5.0
 *
 * このディレクトリの index.ts 以外のファイルは https://openapi-generator.tech で生成されています
 */

import {
  ChannelsApi,
  ConfigApi,
  EventsApi,
  LogApi,
  MiscApi,
  ProgramsApi,
  ServicesApi,
  StatusApi,
  StreamApi,
  TunersApi,
  VersionApi,
} from "./api"
import { Configuration } from "./configuration"
import pkg from "../../../package.json"
import { MirakurunSetting } from "../../types/struct"

export class MirakurunAPI {
  username?: string
  password?: string
  baseUrl: string
  constructor({ username, password, baseUrl }: MirakurunSetting) {
    this.username = username
    this.password = password
    if (!baseUrl) throw new Error("Mirakurun baseUrl error")
    this.baseUrl = baseUrl
  }

  getConfigure() {
    return new Configuration({
      username: this.username,
      password: this.password,
      userAgent: `${pkg.name}/${pkg.version} Electron/${process.versions.electron} Chrome/${process.versions.chrome} (${process.platform}) (+${pkg.repository.url})`,
      basePath: this.baseUrl,
    })
  }

  get channels() {
    return new ChannelsApi(this.getConfigure())
  }

  get config() {
    return new ConfigApi(this.getConfigure())
  }

  get events() {
    return new EventsApi(this.getConfigure())
  }

  get log() {
    return new LogApi(this.getConfigure())
  }

  get misc() {
    return new MiscApi(this.getConfigure())
  }

  get programs() {
    return new ProgramsApi(this.getConfigure())
  }

  get services() {
    return new ServicesApi(this.getConfigure())
  }

  get status() {
    return new StatusApi(this.getConfigure())
  }

  get stream() {
    return new StreamApi(this.getConfigure())
  }

  get tuners() {
    return new TunersApi(this.getConfigure())
  }

  get version() {
    return new VersionApi(this.getConfigure())
  }
}
