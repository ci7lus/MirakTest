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

export type ObjectLiteral<T = unknown> = { [key: string]: T }

export type Routes =
  | "ContentPlayer"
  | "Settings"
  | "ProgramTable"
  | (string & {})

export type InitialData = {
  states: ObjectLiteral
  pluginPaths: string[]
}
