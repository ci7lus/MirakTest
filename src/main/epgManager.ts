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
  userAgent: string | null = null

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
    // 5分毎に終了時間未定の番組の更新を確認
    setInterval(() => this.checkEndOfTbaProgram(), 1000 * 60 * 5)
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
    this.userAgent = payload.userAgent
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
      this.intervals.set(
        payload.url,
        setInterval(() => fetchPrograms(), 1000 * 60 * 60 * 6) // 6時間毎に全更新
      )
      this.checkEndOfTbaProgram()
      const connect = async () => {
        console.info(
          `[epgmanager] 番組イベントストリームへ接続します: ${hostname}`
        )
        const claimStream = await client.events.getEventsStream(
          "program",
          undefined,
          {
            responseType: "stream",
            validateStatus: () => true,
          }
        )
        const statusCode = claimStream.status.toString()
        if (!statusCode.startsWith("2")) {
          console.info(
            `[epgmanager] 番組イベントストリームに対応していません: ${statusCode} / ${hostname}`
          )
          const currentInterval = this.intervals.get(payload.url)
          if (currentInterval) {
            clearInterval(currentInterval)
          }
          this.intervals.set(
            payload.url,
            setInterval(() => fetchPrograms(), 1000 * 60 * 60) // 6->1時間毎に全更新
          )
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

  // TODO: https://github.com/ci7lus/MirakTest/issues/42
  async checkEndOfTbaProgram() {
    const userAgent = this.userAgent
    if (!userAgent) {
      return
    }
    const timestamp = dayjs().tz("Asia/Tokyo").unix() * 1000
    const snapshots = Array.from(this.programs.values())
    const tbaPrograms = Array.from(
      snapshots
        .filter((program) => program.duration === 1)
        .reduce((arr, cur) => {
          arr.set(cur.id, cur)
          return arr
        }, new Map<number, Program>())
        .values()
    )
    const mirakuruns = Array.from(
      new Set([...this.connections.keys(), ...this.intervals.keys()])
    )
    if (mirakuruns.length === 0) {
      return
    }
    const api = new MirakurunAPI({
      baseUrl: mirakuruns[0],
      userAgent,
    })
    for (const program of tbaPrograms) {
      // 24時間以上経過している番組は削除する
      if (timestamp - program.startAt > 24 * 60 * 60 * 1000) {
        console.info(
          `[epgmanager] ${program.id} (${program.name}) は開始から24時間以上経過しています`,
          timestamp,
          program.startAt
        )
        this.programs.delete(program.id)
        this.onEpgUpdate()
        continue
      }
      console.info(
        `[epgmanager] 終了時間未定の番組情報の更新を試みます: ${program.id} (${program.name})`
      )
      const gotProgram = await api.programs.getProgram(program.id, {
        validateStatus: () => true,
      })
      if (gotProgram.status === 200) {
        console.info(
          `[epgmanager] ${program.id} (${program.name}) の番組情報を更新します`
        )
        this.programs.set(program.id, gotProgram.data)
      } else {
        console.info(
          `[epgmanager] ${program.id} (${program.name}) は既に終了しています`
        )
        this.programs.delete(program.id)
        this.onEpgUpdate()
        continue
      }
      // 今放送中のはずの番組を探す
      const sids = Array.from(
        new Set(
          [
            program.serviceId,
            ...(program.relatedItems?.map((item) => item.serviceId) || []),
          ].filter((n): n is number => !!n)
        )
      )
      const current: (Program & { _pf?: true }) | undefined = snapshots.find(
        (snapshot) =>
          program.networkId === snapshot.networkId &&
          sids.includes(snapshot.serviceId) &&
          snapshot.startAt <= timestamp &&
          snapshot.startAt + snapshot.duration >= timestamp &&
          snapshot.duration !== 1
      )
      if (current?._pf) {
        // p/f更新であれば放送中だとみなして終了未定を消す
        console.info(
          `[epgmanager] ${current.id} (${current.name}) は既に放送中です`
        )
        this.programs.delete(program.id)
        this.onEpgUpdate()
      }
    }
  }
}
