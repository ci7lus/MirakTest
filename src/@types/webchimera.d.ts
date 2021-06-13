declare module "webchimera.js" {
  export type PixelFormat = "RV32" | "I420"
  enum _VLCAudioChannel {
    Stereo = 0,
    ReverseStereo = 1,
    Left = 2,
    Right = 3,
    Dolby = 4,
  }
  export type VLCAudio = {
    readonly count: number
    readonly [key: number]: string
    track: number
    mute: boolean
    volume: number
    channel: _VLCAudioChannel
    delay: number
  }
  export type VLCSubtitle = {
    readonly count: number
    readonly [key: number]: string
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
    audio: VLCAudio
    subtitles: VLCSubtitle
  }
  export const createPlayer: (args?: string[]) => Player
  export const path: string | undefined
}
