declare module "webchimera.js" {
  export type PixelFormat = "RV32" | "I420"
  export type VLCSubtitle = {
    readonly count: number
    [key: number]: string
    track: number
    delay: number
  }
  export interface Player {
    readonly vlcVersion: string
    readonly playing: boolean
    readonly length: number
    pixelFormat: PixelFormat
    time: number
    volume: number
    mute: boolean
    play: (url?: string) => void
    pause: () => void
    togglePause: () => void
    stop: () => void
    toggleMute: () => void
    close: () => void
    onLogMessage: (level: string, message: string, format: string) => void
    onFrameReady: (
      frame: {
        width: number
        height: number
        uOffset: number
        vOffset: number
      } & Uint8Array
    ) => void
    subtitles: VLCSubtitle
  }
  export const createPlayer: () => Player
}
