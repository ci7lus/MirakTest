import { EventEmitter } from 'events'
import net from 'net'

export interface MpvTrack {
  id: number
  type: 'video' | 'audio' | 'sub'
  selected: boolean
  title?: string
  lang?: string
  codec?: string
  'demux-channel-count'?: number
  'demux-samplerate'?: number
}

export class MpvIpcClient extends EventEmitter {
  private socket: net.Socket | null = null
  private requestId = 0
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  private buffer = ''
  private _connected = false

  constructor(private socketPath: string) {
    super()
  }

  get connected(): boolean {
    return this._connected
  }

  connect(maxRetries = 15, retryDelayMs = 100): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const tryConnect = () => {
        const sock = net.createConnection(this.socketPath)
        sock.on('connect', () => {
          this.socket = sock
          this._connected = true
          sock.on('data', (data) => this.onData(data.toString()))
          sock.on('close', () => {
            this._connected = false
            this.emit('close')
          })
          sock.on('error', (err) => this.emit('error', err))
          resolve()
        })
        sock.on('error', () => {
          sock.destroy()
          attempts++
          if (attempts >= maxRetries) {
            reject(new Error(`Could not connect to mpv IPC socket: ${this.socketPath}`))
          } else {
            setTimeout(tryConnect, retryDelayMs * Math.min(attempts, 5))
          }
        })
      }
      tryConnect()
    })
  }

  disconnect(): void {
    this.socket?.destroy()
    this.socket = null
    this._connected = false
  }

  private onData(chunk: string): void {
    this.buffer += chunk
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const msg = JSON.parse(line)
        if ('request_id' in msg && this.pending.has(msg.request_id)) {
          const { resolve, reject } = this.pending.get(msg.request_id)!
          this.pending.delete(msg.request_id)
          if (msg.error === 'success') resolve(msg.data)
          else reject(new Error(msg.error))
        } else if ('event' in msg) {
          this.emit('mpv-event', msg)
          if (msg.event === 'property-change') {
            this.emit('property-change', { name: msg.name, data: msg.data })
          } else {
            this.emit(msg.event, msg)
          }
        }
      } catch {
        /* ignore parse errors */
      }
    }
  }

  command(...args: (string | number | boolean | null)[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._connected) {
        reject(new Error('mpv IPC not connected'))
        return
      }
      const id = ++this.requestId
      this.pending.set(id, { resolve, reject })
      this.socket.write(JSON.stringify({ command: args, request_id: id }) + '\n')
    })
  }

  setProperty(name: string, value: unknown): Promise<unknown> {
    return this.command('set_property', name, value as string | number | boolean | null)
  }

  getProperty(name: string): Promise<unknown> {
    return this.command('get_property', name)
  }

  observeProperty(id: number, name: string): Promise<unknown> {
    return this.command('observe_property', id, name)
  }

  loadFile(url: string, flags: 'replace' | 'append' | 'append-play' = 'replace'): Promise<unknown> {
    return this.command('loadfile', url, flags)
  }

  stop(): Promise<unknown> {
    return this.command('stop')
  }

  setPause(paused: boolean): Promise<unknown> {
    return this.setProperty('pause', paused)
  }

  setVolume(volume: number): Promise<unknown> {
    return this.setProperty('volume', volume)
  }

  setSpeed(speed: number): Promise<unknown> {
    return this.setProperty('speed', speed)
  }

  seekAbsolute(seconds: number): Promise<unknown> {
    return this.command('seek', seconds, 'absolute')
  }

  seekPercent(percent: number): Promise<unknown> {
    return this.setProperty('percent-pos', percent)
  }

  setAid(id: number | 'no'): Promise<unknown> {
    return this.setProperty('aid', id)
  }

  setSid(id: number | 'no'): Promise<unknown> {
    return this.setProperty('sid', id)
  }

  async getTrackList(): Promise<MpvTrack[]> {
    const result = await this.getProperty('track-list')
    return (result as MpvTrack[]) ?? []
  }
}
