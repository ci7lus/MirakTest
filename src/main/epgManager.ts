import type { Readable } from "stream"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { IpcMain } from "electron"
import { chain } from "stream-chain"
import { parser } from "stream-json"
import { streamArray } from "stream-json/streamers/StreamArray"
import * as $ from "zod"
import { EPG_MANAGER } from "../constants/ipc"
import { MirakurunAPI } from "../infra/mirakurun"
import { Event, Program, EventType } from "../infra/mirakurun/api"

dayjs.extend(utc)
dayjs.extend(timezone)

const registerSchema = $.object({
  userAgent: $.string(),
  url: $.string(),
})

export type RegisterSchema = $.infer<typeof registerSchema>

export type UnregisterSchema = string

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
  intervals = new Map<string, NodeJS.Timeout>()
  programs = new Map<number, Program>()

  constructor(ipcMain: IpcMain, private onEpgUpdate: () => void) {
    ipcMain.handle(EPG_MANAGER.REGISTER, (_, arg) => this.register(arg))
    ipcMain.handle(EPG_MANAGER.UNREGISTER, (_, arg) => this.unregister(arg))
    ipcMain.handle(EPG_MANAGER.QUERY, (_, arg) => this.query(arg))

    setInterval(() => {
      const startOfHour = dayjs().tz("Asia/Tokyo").startOf("hour").unix() * 1000
      const result = Array.from(this.programs.values())
        .filter(
          (program) =>
            // durationが1の場合は終了時間未定
            program.duration !== 1 &&
            program.startAt + program.duration < startOfHour
        )
        .map((program) => this.programs.delete(program.id))
        .filter((b) => b)
      console.info(`[epgmanager] 番組情報を削除しました: ${result.length}`)
    }, 1000 * 60 * 60)
  }

  async register(_payload: unknown) {
    const payload = registerSchema.parse(_payload)
    if (
      this.processing.has(payload.url) ||
      this.connections.has(payload.url) ||
      this.intervals.has(payload.url)
    ) {
      return
    }
    this.processing.set(payload.url, true)
    const client = new MirakurunAPI({
      baseUrl: payload.url,
      userAgent: payload.userAgent,
    })
    const hostname = new URL(payload.url).hostname
    try {
      const fetchPrograms = async () => {
        console.info(`[epgmanager] 番組情報を取得します: ${hostname}`)
        const programs = await client.programs
          .getPrograms()
          .then((res) => res.data)
        for (const program of programs) {
          this.programs.set(program.id, program)
        }
        this.onEpgUpdate()
      }
      await fetchPrograms()
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
        const statusCode = claimStream.status.toString()
        if (!statusCode.startsWith("2")) {
          console.info(
            `[epgmanager] 番組イベントストリームに対応していません: ${statusCode} / ${hostname}`
          )
          if (400 <= claimStream.status) {
            this.intervals.set(
              payload.url,
              setInterval(fetchPrograms, 1000 * 60 * 60)
            )
          }
          return
        }
        const stream = claimStream.data as unknown as Readable
        const pipeline = chain([stream, parser(), streamArray()])
        pipeline.on("data", ({ value }: { value: Event }) => {
          const program = value.data as Program
          switch (value.type) {
            case EventType.Create:
            case EventType.Update: {
              this.programs.set(program.id, program)
              this.onEpgUpdate()
              break
            }
            case EventType.Remove: {
              this.programs.delete(program.id)
              this.onEpgUpdate()
              break
            }
          }
        })
        pipeline.on("error", (err) => console.error(err))
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
    const url = $.string().parse(_payload)
    const stream = this.connections.get(url)
    const hostname = new URL(url).hostname
    if (stream) {
      stream.destroy()
      this.connections.delete(url)
      console.info(
        `[epgmanager] 番組イベントストリームを切断しました: ${hostname}`
      )
    }
    const interval = this.intervals.get(url)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(url)
      console.info(`[epgmanager] 番組情報の定期取得を解除しました: ${hostname}`)
    }
  }

  query(payload: unknown) {
    const query = querySchema.parse(payload)
    return Array.from(this.programs.values()).filter(
      (program) =>
        (!query.serviceId || program.serviceId === query.serviceId) &&
        (!query.networkId || program.networkId === query.networkId) &&
        (!query.startAt || query.startAt <= program.startAt) &&
        (!query.endAt ||
          program.duration === 1 ||
          program.startAt + program.duration <= query.endAt) &&
        (!query.startAtLessThan || program.startAt <= query.startAtLessThan) &&
        (!query.endAtMoreThan ||
          program.duration === 1 ||
          query.endAtMoreThan <= program.startAt + program.duration)
    )
  }
}
