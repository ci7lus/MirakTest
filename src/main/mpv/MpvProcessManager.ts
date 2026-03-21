import { ChildProcess, spawn } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { app } from 'electron'
import { MpvIpcClient } from './MpvIpcClient'
import { TsCaptionExtractor } from './TsCaptionExtractor'

export interface MpvInstance {
  process: ChildProcess
  ipc: MpvIpcClient
  socketPath: string
  captionExtractor: TsCaptionExtractor | null
}

export class MpvProcessManager {
  private instances = new Map<number, MpvInstance>()

  getMpvBinaryPath(): string {
    // In packaged app: Contents/MacOS/mpv
    if (app.isPackaged) {
      return path.join(process.resourcesPath, '..', 'MacOS', 'mpv')
    }
    // In development: look next to Electron binary or in PATH
    const devPath = path.join(path.dirname(process.execPath), 'mpv')
    if (fs.existsSync(devPath)) return devPath
    // Fallback: system mpv (Homebrew)
    return '/opt/homebrew/bin/mpv'
  }

  async createInstance(
    windowId: number,
    wid: string,
    extraArgs: string[] = [],
    userAgent = 'mirak'
  ): Promise<MpvInstance> {
    await this.destroyInstance(windowId)

    const socketPath = path.join(os.tmpdir(), `mpv-mirak-${windowId}-${Date.now()}.sock`)
    const mpvBin = this.getMpvBinaryPath()

    const args = [
      '--no-terminal',
      '--idle=yes',
      '--keep-open=yes',
      '--force-window=no',
      `--input-ipc-server=${socketPath}`,
      `--wid=${wid}`,
      '--hwdec=videotoolbox',
      '--sid=no', // disable mpv subtitle rendering (using aribb24.js)
      '--vo=gpu',
      '--cache=yes',
      '--demuxer-lavf-probesize=4096',
      `--user-agent=${userAgent}`,
      '--msg-level=all=status',
      ...extraArgs,
    ]

    const proc = spawn(mpvBin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DYLD_LIBRARY_PATH: app.isPackaged
          ? path.join(process.resourcesPath, '..', 'Frameworks')
          : process.env.DYLD_LIBRARY_PATH,
      },
    })

    proc.on('error', (err) => console.error(`[mpv:${windowId}] spawn error:`, err))
    proc.stdout?.on('data', (d: Buffer) => console.debug(`[mpv:${windowId}]`, d.toString().trim()))
    proc.stderr?.on('data', (d: Buffer) =>
      console.debug(`[mpv:${windowId}] stderr:`, d.toString().trim())
    )

    const ipc = new MpvIpcClient(socketPath)
    await ipc.connect()

    await Promise.all([
      ipc.observeProperty(1, 'time-pos'),
      ipc.observeProperty(2, 'pause'),
      ipc.observeProperty(3, 'percent-pos'),
      ipc.observeProperty(4, 'seekable'),
      ipc.observeProperty(5, 'track-list'),
      ipc.observeProperty(6, 'video-params'),
      ipc.observeProperty(7, 'demuxer-cache-state'),
      ipc.observeProperty(8, 'eof-reached'),
    ])

    const instance: MpvInstance = { process: proc, ipc, socketPath, captionExtractor: null }
    this.instances.set(windowId, instance)
    return instance
  }

  getInstance(windowId: number): MpvInstance | undefined {
    return this.instances.get(windowId)
  }

  getIpc(windowId: number): MpvIpcClient | undefined {
    return this.instances.get(windowId)?.ipc
  }

  async startCaptionExtractor(windowId: number, url: string, userAgent: string): Promise<void> {
    const instance = this.instances.get(windowId)
    if (!instance) return
    instance.captionExtractor?.stop()
    const extractor = new TsCaptionExtractor(url, userAgent)
    instance.captionExtractor = extractor
    extractor.start()
  }

  stopCaptionExtractor(windowId: number): void {
    const instance = this.instances.get(windowId)
    if (!instance) return
    instance.captionExtractor?.stop()
    instance.captionExtractor = null
  }

  async destroyInstance(windowId: number): Promise<void> {
    const instance = this.instances.get(windowId)
    if (!instance) return
    this.instances.delete(windowId)
    instance.captionExtractor?.stop()
    instance.ipc.disconnect()
    instance.process.kill('SIGTERM')
    try {
      fs.unlinkSync(instance.socketPath)
    } catch {
      /* ignore */
    }
  }

  async destroyAll(): Promise<void> {
    const ids = [...this.instances.keys()]
    await Promise.all(ids.map((id) => this.destroyInstance(id)))
  }
}
