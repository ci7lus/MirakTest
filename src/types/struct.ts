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
