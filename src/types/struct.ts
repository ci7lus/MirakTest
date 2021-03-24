export type CommentPayload = {
  sourceUrl: string | null
  source: string
  no: number
  time: number
  timeMs: number
  author: string
  text: string
  color: string
  type: "right"
  commands: []
}

export type MirakurunSetting = {
  username?: string
  password?: string
  baseUrl?: string
}

export type MainPlayerRoute = "settings" | "programTable" | null

export type SayaSetting = {
  baseUrl?: string
  secure?: boolean
}
