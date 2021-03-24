export const VLCLogFilter = (s: string) => {
  if (
    s.startsWith("picture is too late to be displayed") ||
    s.startsWith("picture might be displayed late") ||
    s.startsWith("More than")
  ) {
    return { category: "picture_late_warn" } as const
  } else if (s.startsWith("libdvbpsi error")) {
    return { category: "libdvbpsi_error" } as const
  } else if (s.startsWith("Stream buffering done")) {
    return { category: "stream_buffering_done" } as const
  } else if (s.startsWith("Decoder wait done")) {
    return { category: "decoder_wait_done" } as const
  } else if (s.startsWith("size ") && s.includes("fps=")) {
    const m = s.match(/(\d+)x(\d+)\/(\d+)x(\d+)\sfps\=([\d.]+)/)
    if (!m) return { category: "size" } as const
    const [, displayWidth, displayHeight, width, height, fps] = m
    return {
      category: "size",
      displayWidth,
      displayHeight,
      width,
      height,
      fps,
    } as const
  } else if (s.startsWith("VoutDisplayEvent 'resize'")) {
    const m = s.match(/VoutDisplayEvent 'resize' (\d+)x(\d+)/)
    if (!m) return { category: "resize" } as const
    const [, width, height] = m
    return {
      category: "resize",
      width: parseInt(width),
      height: parseInt(height),
    } as const
  } else if (s.startsWith("VLC is unable to open the MRL")) {
    return { category: "unable_to_open" } as const
  } else {
    return { category: "unknown" } as const
  }
}
