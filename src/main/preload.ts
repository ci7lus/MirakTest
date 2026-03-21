import fs from "fs"
import path from "path"
import { contextBridge, ipcRenderer, shell } from "electron"
import {
  REQUEST_CONFIRM_DIALOG,
  EPG_MANAGER,
  ON_WINDOW_MOVED,
  RECOIL_STATE_UPDATE,
  REQUEST_APP_PATH,
  REQUEST_CONTENT_BOUNDS,
  REQUEST_CURSOR_SCREEN_POINT,
  REQUEST_DIALOG,
  REQUEST_INITIAL_DATA,
  REUQEST_OPEN_WINDOW,
  SET_WINDOW_ASPECT,
  SET_WINDOW_CONTENT_BOUNDS,
  SET_WINDOW_POSITION,
  SET_WINDOW_TITLE,
  SHOW_NOTIFICATION,
  SHOW_WINDOW,
  TOGGLE_ALWAYS_ON_TOP,
  TOGGLE_FULL_SCREEN,
  REQUEST_SCREENSHOT_BASE_PATH,
  ON_SCREENSHOT_REQUEST,
  UPDATE_GLOBAL_SCREENSHOT_ACCELERATOR,
  EXIT_FULL_SCREEN,
  SET_WINDOW_BUTTON_VISIBILITY,
  REQUEST_WINDOW_SCREENSHOT,
  REQUEST_WRITE_IMAGE_TO_CLIPBOARD,
} from "../constants/ipc"
import {
  EPGManagerRegisterArg,
  OpenWindowArg,
  Preload,
  SerializableKV,
} from "../types/ipc"
import { store } from "../utils/store"
import { QuerySchema } from "./epgManager"
import { exists, isChildOf, isChildOfHome, isHidden } from "./fsUtils"

const MPV_EVENT = "mpv-event"
const MPV_SETUP = "mpv-setup"
const MPV_DESTROY = "mpv-destroy"
const MPV_COMMAND = "mpv-command"
const MPV_SET_PROPERTY = "mpv-set-property"
const MPV_LOAD_FILE = "mpv-load-file"
const MPV_STOP = "mpv-stop"
const MPV_NATIVE_HANDLE = "mpv-native-handle"
const MPV_RESIZE_VIEW = "mpv-resize-view"
const MPV_SCREENSHOT = "mpv-screenshot"

const preload: Preload = {
  webchimera: (() => {
    let isSetUp = false
    let isPlayingCached = false
    let hasVoutCached = false
    let cachedSubtitleTrack = 0
    let cachedAudioChannel = 1
    const cachedAudioTracks: string[] = []

    type Listener = (...args: unknown[]) => void
    const listeners = new Map<string, Set<Listener>>()

    const addListener = (event: string, fn: Listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listeners.get(event)!.add(fn)
    }

    ipcRenderer.on(
      MPV_EVENT,
      (_, payload: { event: string; data: unknown }) => {
        const { event, data } = payload
        // Update cache before dispatching so synchronous callbacks see current state
        if (event === "property-change") {
          const p = data as { name: string; data: unknown }
          if (p.name === "pause") isPlayingCached = p.data === false
          if (p.name === "video-params") hasVoutCached = p.data != null
        }
        if (event === "file-loaded") {
          isPlayingCached = true
          hasVoutCached = false
        }
        if (event === "end-file") isPlayingCached = false
        listeners.get(event)?.forEach((fn) => fn(data))
      }
    )

    return {
      async setup(args: string[]) {
        isSetUp = (await ipcRenderer.invoke(MPV_SETUP, args)) as boolean
      },
      isOk() {
        return isSetUp
      },

      onTimeChanged(listener: (time: number) => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "time-pos" && p.data != null) {
            listener(Math.round((p.data as number) * 1000)) // seconds → ms
          }
        })
      },

      onLogMessage(listener: (level: string, message: string) => void) {
        addListener("arib-data", (data: unknown) => {
          const d = data as { data: string; pts: number }
          listener("status", `arib_data [${d.data}][${d.pts}]`)
        })
        addListener("pcr", (data: unknown) => {
          const d = data as { pcr: number; firstPcr: number }
          listener("status", `i_pcr [${d.pcr}][${d.firstPcr}]`)
        })
        addListener("tot", (data: unknown) => {
          const d = data as { tot: number }
          listener("status", `tot [${d.tot}]`)
        })
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onFrameReady(_listener) {
        // No-op: mpv renders directly to NSView, no frame callbacks
      },

      onMediaChanged(listener: () => void) {
        addListener("file-loaded", () => listener())
      },

      onEncounteredError(listener: () => void) {
        addListener("end-file", (data: unknown) => {
          if ((data as { reason?: string })?.reason === "error") listener()
        })
      },

      onBuffering(listener: (percent: number) => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "demuxer-cache-state") {
            const cs = p.data as { "cache-duration"?: number } | null
            listener(
              cs?.["cache-duration"] != null && cs["cache-duration"] > 0
                ? 100
                : 0
            )
          }
        })
      },

      onStopped(listener: () => void) {
        addListener("end-file", (data: unknown) => {
          const reason = (data as { reason?: string })?.reason
          if (reason === "stop" || reason === "quit") listener()
        })
      },

      onEndReached(listener: () => void) {
        addListener("end-file", (data: unknown) => {
          if ((data as { reason?: string })?.reason === "eof") listener()
        })
      },

      onPaused(listener: () => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "pause" && p.data === true) listener()
        })
      },

      onPlaying(listener: () => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "pause" && p.data === false) listener()
        })
        addListener("playback-restart", () => listener())
      },

      onSeekableChanged(listener: (seekable: boolean) => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "seekable") listener(!!p.data)
        })
      },

      onPositionChanged(listener: (position: number) => void) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "percent-pos" && p.data != null) {
            listener((p.data as number) / 100)
          }
        })
      },

      onVideoParamsChanged(
        listener: (w: number, h: number, dw: number, dh: number) => void
      ) {
        addListener("property-change", (data: unknown) => {
          const p = data as { name: string; data: unknown }
          if (p?.name === "video-params" && p.data) {
            const vp = p.data as {
              w: number
              h: number
              "display-w"?: number
              "display-h"?: number
            }
            listener(
              vp.w,
              vp.h,
              vp["display-w"] ?? vp.w,
              vp["display-h"] ?? vp.h
            )
          }
        })
      },

      destroy() {
        ipcRenderer.invoke(MPV_DESTROY)
        isSetUp = false
        isPlayingCached = false
        hasVoutCached = false
        listeners.clear()
      },

      setVolume(volume: number) {
        ipcRenderer.invoke(MPV_SET_PROPERTY, "volume", volume)
      },
      play(url: string) {
        ipcRenderer.invoke(MPV_LOAD_FILE, url)
      },
      togglePause() {
        ipcRenderer.invoke(MPV_COMMAND, "cycle", "pause")
      },
      stop() {
        ipcRenderer.invoke(MPV_STOP)
      },
      hasVout() {
        return hasVoutCached
      },
      isPlaying() {
        return isPlayingCached
      },

      getSubtitleTrack() {
        return cachedSubtitleTrack
      },
      setSubtitleTrack(track: number) {
        cachedSubtitleTrack = track
        ipcRenderer.invoke(MPV_SET_PROPERTY, "sid", track === 0 ? "no" : track)
      },

      getAudioChannel() {
        return cachedAudioChannel
      },
      setAudioChannel(channel: number) {
        cachedAudioChannel = channel
        // Map VLC audio channel model to mpv audio-channels
        const channelMap: Record<number, string> = {
          1: "stereo",
          2: "stereo",
          3: "stereo",
          4: "stereo",
          5: "stereo",
        }
        ipcRenderer.invoke(
          MPV_SET_PROPERTY,
          "audio-channels",
          channelMap[channel] ?? "stereo"
        )
      },

      setPosition(position: number) {
        ipcRenderer.invoke(MPV_SET_PROPERTY, "percent-pos", position * 100)
      },

      getAudioTracks() {
        return cachedAudioTracks
      },
      setAudioTrack(track: number) {
        ipcRenderer.invoke(MPV_SET_PROPERTY, "aid", track)
      },
      setSpeed(speed: number) {
        ipcRenderer.invoke(MPV_SET_PROPERTY, "speed", speed)
      },

      async getNativeHandle() {
        return ipcRenderer.invoke(MPV_NATIVE_HANDLE) as Promise<Buffer | null>
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async createNSView(_: number, _y: number, _w: number, _h: number) {
        // The main process handles NSView creation internally via MPV_SETUP
        return null
      },

      resizeNSView(
        viewId: number,
        x: number,
        y: number,
        w: number,
        h: number
      ) {
        ipcRenderer.invoke(MPV_RESIZE_VIEW, viewId, x, y, w, h)
      },
    }
  })(),
  requestMpvScreenshot() {
    return ipcRenderer.invoke(MPV_SCREENSHOT) as Promise<Buffer | null>
  },
  requestInitialData() {
    return ipcRenderer.invoke(REQUEST_INITIAL_DATA)
  },
  recoilStateUpdate: (arg: SerializableKV) => {
    return ipcRenderer.invoke(RECOIL_STATE_UPDATE, arg)
  },
  onRecoilStateUpdate: (listener: (arg: SerializableKV) => void) => {
    const _listener = (_: unknown, arg: SerializableKV) => {
      listener(arg)
    }
    ipcRenderer.addListener(RECOIL_STATE_UPDATE, _listener)
    return () => {
      ipcRenderer.removeListener(RECOIL_STATE_UPDATE, _listener)
    }
  },
  store: {
    get: <T = unknown>(key: string): T => {
      return store.get(key)
    },
    set: (key: string, value: unknown) => {
      store.set(key, value)
    },
    delete: (key) => {
      store.delete(key as never)
    },
    openConfig() {
      store.openInEditor()
    },
  },
  onWindowMoved(listener) {
    ipcRenderer.on(ON_WINDOW_MOVED, () => {
      listener()
    })
    return () => {
      ipcRenderer.off(ON_WINDOW_MOVED, listener)
    }
  },
  onScreenshotRequest(listener) {
    ipcRenderer.on(ON_SCREENSHOT_REQUEST, () => listener())
    return () => {
      ipcRenderer.off(ON_SCREENSHOT_REQUEST, listener)
    }
  },
  requestScreenshotBasePath() {
    return ipcRenderer.invoke(REQUEST_SCREENSHOT_BASE_PATH)
  },
  async updateGlobalScreenshotAccelerator(accelerator) {
    return await ipcRenderer.invoke(
      UPDATE_GLOBAL_SCREENSHOT_ACCELERATOR,
      accelerator
    )
  },
  setWindowButtonVisibility(v) {
    return ipcRenderer.invoke(SET_WINDOW_BUTTON_VISIBILITY, v)
  },
  requestWindowScreenshot(fileName) {
    return ipcRenderer.invoke(REQUEST_WINDOW_SCREENSHOT, fileName)
  },
  public: {
    epgManager: {
      register: (arg: EPGManagerRegisterArg) => {
        return ipcRenderer.invoke(EPG_MANAGER.REGISTER, arg)
      },
      unregister: (url: string) => {
        return ipcRenderer.invoke(EPG_MANAGER.UNREGISTER, url)
      },
      query: (arg: QuerySchema) => {
        return ipcRenderer.invoke(EPG_MANAGER.QUERY, arg)
      },
    },
    requestAppPath(name) {
      return ipcRenderer.invoke(REQUEST_APP_PATH, name)
    },
    showNotification(arg, path) {
      ipcRenderer.invoke(SHOW_NOTIFICATION, arg, path)
    },
    setWindowContentBounds(bounds) {
      ipcRenderer.invoke(SET_WINDOW_CONTENT_BOUNDS, bounds)
    },
    requestShellOpenPath(path) {
      return shell.openPath(path)
    },
    joinPath(...paths) {
      return path.join(...paths)
    },
    requestDialog(arg) {
      return ipcRenderer.invoke(REQUEST_DIALOG, arg)
    },
    writeArrayBufferToClipboard(buff) {
      return ipcRenderer.invoke(REQUEST_WRITE_IMAGE_TO_CLIPBOARD, buff)
    },
    requestCursorScreenPoint() {
      return ipcRenderer.invoke(REQUEST_CURSOR_SCREEN_POINT)
    },
    toggleFullScreen() {
      ipcRenderer.invoke(TOGGLE_FULL_SCREEN)
    },
    exitFullScreen() {
      ipcRenderer.invoke(EXIT_FULL_SCREEN)
    },
    toggleAlwaysOnTop() {
      ipcRenderer.invoke(TOGGLE_ALWAYS_ON_TOP)
    },
    requestWindowContentBounds() {
      return ipcRenderer.invoke(REQUEST_CONTENT_BOUNDS)
    },
    setWindowPosition: (x: number, y: number) => {
      ipcRenderer.invoke(SET_WINDOW_POSITION, x, y)
    },
    showWindow: () => {
      ipcRenderer.invoke(SHOW_WINDOW)
    },
    setWindowTitle: (title: string) => {
      ipcRenderer.invoke(SET_WINDOW_TITLE, title)
    },
    setWindowAspect: (aspect: number) => {
      ipcRenderer.invoke(SET_WINDOW_ASPECT, aspect)
    },
    requestOpenWindow: (arg: OpenWindowArg) => {
      return ipcRenderer.invoke(REUQEST_OPEN_WINDOW, arg)
    },
    isDirectoryExists: async (path: string) => {
      return new Promise<boolean>((res) => {
        fs.promises
          .stat(path)
          .then(() => {
            res(true)
          })
          .catch(() => res(false))
      })
    },
    requestConfirmDialog(message, buttons) {
      return ipcRenderer.invoke(REQUEST_CONFIRM_DIALOG, message, buttons)
    },
    async writeFile({ path, buffer }) {
      const screenshotPath = await preload.requestScreenshotBasePath()
      const isNotChild = !isChildOfHome(path)
      const isAlreadyExists = await exists(path)
      const isHiddenFile = isHidden(path)
      if (
        (!screenshotPath || !isChildOf(path, screenshotPath)) &&
        (isNotChild || isAlreadyExists || isHiddenFile)
      ) {
        const ask = await preload.public.requestConfirmDialog(
          `「${path}」${
            isHiddenFile
              ? "は隠しファイルです。"
              : isNotChild
              ? "はホームディレクトリの外です。"
              : "は既に存在します。"
          }書き込みを許可しますか？`,
          ["許可する", "拒否する"]
        )
        if (ask.response === 1) {
          return false
        }
      }
      await fs.promises.writeFile(path, Buffer.from(buffer))
      return true
    },
    invoke(channel, ...args) {
      return ipcRenderer.invoke(channel, ...args)
    },
    onCustomIpcListener(channel, listener) {
      ipcRenderer.on(channel, (_, arg) => {
        listener(arg)
      })
      return () => {
        ipcRenderer.off(channel, listener)
      }
    },
  },
}

contextBridge.exposeInMainWorld("Preload", preload)
