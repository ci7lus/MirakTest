import type { Readable } from "stream"
import type { IpcMain } from "electron"
import { chain } from "stream-chain"
import { parser } from "stream-json"
import { streamArray } from "stream-json/streamers/StreamArray"
import * as $ from "zod"
import { EPG_MANAGER } from "../constants/ipc"
import { MirakurunAPI } from "../infra/mirakurun"
import { Event, Program, EventType } from "../infra/mirakurun/api"

const registerSchema = $.object({
  userAgent: $.string(),
  url: $.string(),
})

export type RegisterSchema = $.infer<typeof registerSchema>

const unregisterSchema = $.object({
  url: $.string(),
})

export type UnregisterSchema = $.infer<typeof unregisterSchema>

const querySchema = $.object({
  startAt: $.number().optional(),
  endAt: $.number().optional(),
  startAtLessThan: $.number().optional(),
  endAtMoreThan: $.number().optional(),
  serviceId: $.number().optional(),
  networkId: $.number().optional(),
})

export type QuerySchema = $.infer<typeof querySchema>

export class EPGManager {
  processing = new Map<string, boolean>()
  connections = new Map<string, Readable>()
  programs = new Map<number, Program>()

  constructor(ipcMain: IpcMain) {
    ipcMain.handle(EPG_MANAGER.REGISTER, (_, arg) => this.register(arg))
    ipcMain.handle(EPG_MANAGER.UNREGISTER, (_, arg) => this.unregister(arg))
    ipcMain.handle(EPG_MANAGER.QUERY, (_, arg) => this.query(arg))
  }

  async register(_payload: unknown) {
    const payload = registerSchema.parse(_payload)
    if (this.processing.has(payload.url) || this.connections.has(payload.url)) {
      return
    }
    this.processing.set(payload.url, true)
    const client = new MirakurunAPI({
      baseUrl: payload.url,
      userAgent: payload.userAgent,
    })
    const hostname = new URL(payload.url).hostname
    try {
      console.info(`[epgmanager] 番組情報を取得します: ${hostname}`)
      const programs = await client.programs
        .getPrograms()
        .then((res) => res.data)
      for (const program of programs) {
        this.programs.set(program.id, program)
      }
      const connect = async () => {
        console.info(
          `[epgmanager] 番組イベントストリームへ接続します: ${hostname}`
        )
        const claimStream = await client.events.getEventsStream(
          "program",
          undefined,
          {
            responseType: "stream",
          }
        )
        const stream = claimStream.data as unknown as Readable
        const pipeline = chain([stream, parser(), streamArray()])
        pipeline.on("data", ({ value }: { value: Event }) => {
          const program = value.data as Program
          switch (value.type) {
            case EventType.Create:
            case EventType.Update: {
              this.programs.set(program.id, program)
              break
            }
            case EventType.Remove: {
              this.programs.delete(program.id)
              break
            }
          }
        })
        stream.on("close", async () => {
          pipeline.destroy()
          console.info(`[epgmanager] 切断されました: ${hostname}`)
          if (this.connections.has(payload.url)) {
            setTimeout(() => connect(), 5000)
          }
        })
        this.connections.set(payload.url, stream)
      }
      connect()
    } catch (e) {
      console.error("[epgmanager] 番組表の取得に失敗しました", e)
    } finally {
      this.processing.delete(payload.url)
    }
  }

  unregister(_payload: unknown) {
    const payload = unregisterSchema.parse(_payload)
    const stream = this.connections.get(payload.url)
    if (stream) {
      stream.destroy()
      this.connections.delete(payload.url)
    }
  }

  query(payload: unknown) {
    const query = querySchema.parse(payload)
    return Array.from(this.programs.values()).filter(
      (program) =>
        (!query.serviceId || program.serviceId === query.serviceId) &&
        (!query.networkId || program.networkId === query.networkId) &&
        (!query.startAt || query.startAt <= program.startAt) &&
        (!query.endAt || program.startAt + program.duration <= query.endAt) &&
        (!query.startAtLessThan || program.startAt <= query.startAtLessThan) &&
        (!query.endAtMoreThan ||
          query.endAtMoreThan <= program.startAt + program.duration)
    )
  }
}
