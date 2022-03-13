import { VideoRenderer } from "./videoRenderer"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worker: Worker = self as any

let canvas: OffscreenCanvas | null = null
let context: VideoRenderer | null = null

worker.onmessage = (event) => {
  if ("canvas" in event.data) {
    canvas = event.data.canvas
    context = new VideoRenderer(event.data.canvas, {
      preserveDrawingBuffer: true,
    })
    return
  }
  if ("render" in event.data) {
    const { render, videoFrame } = event.data as {
      render: {
        width: number
        height: number
        uOffset: number
        vOffset: number
      }
      videoFrame: Uint8Array
    }
    context?.render(
      videoFrame,
      render.width,
      render.height,
      render.uOffset,
      render.vOffset
    )
  }
}

export {}
