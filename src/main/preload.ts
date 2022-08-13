import fs from "fs"
import path from "path"
import { contextBridge, ipcRenderer, shell } from "electron"
import WebChimera from "webchimera.js"
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
  UPDATE_IS_PLAYING_STATE,
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

let wc: WebChimera.Player | null = null

const preload: Preload = {
  webchimera: {
    setup(args) {
      wc = WebChimera.createPlayer(args)
    },
    isOk() {
      return !!wc
    },
    onTimeChanged(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onTimeChanged = (time) => listener(time)
    },
    onLogMessage(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onLogMessage = (level, message) => listener(level, message)
    },
    onFrameReady(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onFrameReady = (frame) =>
        listener(frame, frame.width, frame.height, frame.uOffset, frame.vOffset)
    },
    onMediaChanged(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onMediaChanged = () => listener()
    },
    onEncounteredError(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onEncounteredError = () => listener()
    },
    onBuffering(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onBuffering = (p) => listener(p)
    },
    onStopped(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onStopped = () => listener()
    },
    onEndReached(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onEndReached = () => listener()
    },
    onPaused(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onPaused = () => listener()
    },
    onPlaying(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onPlaying = () => listener()
    },
    onSeekableChanged(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onSeekableChanged = (isSeekable) => listener(isSeekable)
    },
    onPositionChanged(listener) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.onPositionChanged = (position) => listener(position)
    },
    destroy() {
      wc?.close()
      wc = null
    },
    setVolume(volume) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.volume = volume
    },
    play(url: string) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.play(url)
    },
    togglePause() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.togglePause()
    },
    stop() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.stop()
    },
    hasVout() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      return wc.input.hasVout
    },
    isPlaying() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      return wc.playing
    },
    getSubtitleTrack() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      return wc.subtitles.track
    },
    setSubtitleTrack(track) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.subtitles.track = track
    },
    getAudioChannel() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      return wc.audio.channel
    },
    setAudioChannel(channel) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.audio.channel = channel
    },
    setPosition(position) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.position = position
    },
    getAudioTracks() {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      return [...Array(wc.audio.count).keys()].map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (trackId) => wc!.audio[trackId]
      )
    },
    setAudioTrack(track) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.audio.track = track
    },
    setSpeed(speed) {
      if (!wc) {
        throw new Error("wc is not initialized")
      }
      wc.input.rate = speed
    },
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
  updateIsPlayingState: (arg) => {
    return ipcRenderer.invoke(UPDATE_IS_PLAYING_STATE, arg)
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
  onUpdateIsPlayingState(listener) {
    ipcRenderer.on(UPDATE_IS_PLAYING_STATE, (_, arg) => {
      listener(arg)
    })
    return () => {
      ipcRenderer.off(UPDATE_IS_PLAYING_STATE, listener)
    }
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
