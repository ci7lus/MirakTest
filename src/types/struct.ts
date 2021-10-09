import { ROUTES } from "../constants/routes"

export type ObjectLiteral<T = unknown> = { [key: string]: T }

export type Routes = keyof typeof ROUTES | (string & {})

export type InitialData = {
  states: ObjectLiteral
  pluginPaths: string[]
}
