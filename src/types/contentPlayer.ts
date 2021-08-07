import type { Program, Service } from "../infra/mirakurun/api"

export type ContentPlayerContentType = "Mirakurun" | (string & {})

export type ContentPlayerPlayingContent = {
  contentType: ContentPlayerContentType
  isLive: boolean
  url: string
  program?: Program
  service?: Service
}

export type ContentPlayerKeyForRestoration = {
  contentType: "Mirakurun"
  serviceId: number
}

export type AribSubtitleData = {
  data: string
  pts: number
}
