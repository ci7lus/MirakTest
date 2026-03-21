import { EventEmitter } from 'events'
import http from 'http'
import https from 'https'
import { URL } from 'url'

// MPEG-2 TS constants
const TS_PACKET_SIZE = 188
const TS_SYNC_BYTE = 0x47

export interface AribDataEvent {
  data: string // base64 encoded ARIB caption data
  pts: number // PTS in 90kHz units
}

export interface PcrEvent {
  pcr: number // current PCR in 90kHz units
  firstPcr: number // first PCR seen (for timing base)
}

export class TsCaptionExtractor extends EventEmitter {
  private abortController: { abort: () => void } | null = null
  private pcrPid = -1
  private captionPid = -1
  private pmtPid = -1
  private firstPcr = 0
  private pmtParsed = false
  private pesBuffer = new Map<number, Buffer>()

  constructor(private url: string, private userAgent = 'mirak') {
    super()
  }

  start(): void {
    this.stop()
    this.resetState()
    this.fetchStream()
  }

  stop(): void {
    this.abortController?.abort()
    this.abortController = null
  }

  private resetState(): void {
    this.pcrPid = -1
    this.captionPid = -1
    this.pmtPid = -1
    this.firstPcr = 0
    this.pmtParsed = false
    this.pesBuffer.clear()
  }

  private fetchStream(): void {
    const parsedUrl = new URL(this.url)
    const lib = parsedUrl.protocol === 'https:' ? https : http
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { 'User-Agent': this.userAgent },
    }

    const req = lib.get(options, (res) => {
      let leftover = Buffer.alloc(0)

      res.on('data', (chunk: Buffer) => {
        const data = Buffer.concat([leftover, chunk])
        const packetCount = Math.floor(data.length / TS_PACKET_SIZE)
        leftover = data.slice(packetCount * TS_PACKET_SIZE)

        for (let i = 0; i < packetCount; i++) {
          const packet = data.slice(i * TS_PACKET_SIZE, (i + 1) * TS_PACKET_SIZE)
          if (packet[0] !== TS_SYNC_BYTE) continue
          this.processPacket(packet)
        }
      })

      res.on('error', () => {
        /* stream ended */
      })
    })

    req.on('error', () => {
      /* connection failed */
    })
    this.abortController = { abort: () => req.destroy() }
  }

  private processPacket(packet: Buffer): void {
    const pid = ((packet[1] & 0x1f) << 8) | packet[2]
    const payloadUnitStart = (packet[1] >> 6) & 1
    const adaptationFieldControl = (packet[3] >> 4) & 3
    const hasAdaptation = (adaptationFieldControl & 2) !== 0
    const hasPayload = (adaptationFieldControl & 1) !== 0

    if (pid === 0 && hasPayload) {
      const payloadOffset = hasAdaptation ? 4 + 1 + packet[4] : 4
      this.parsePAT(packet, payloadOffset, payloadUnitStart)
      return
    }

    if (pid === this.pmtPid && hasPayload && !this.pmtParsed) {
      const payloadOffset = hasAdaptation ? 4 + 1 + packet[4] : 4
      this.parsePMT(packet, payloadOffset, payloadUnitStart)
      return
    }

    // PCR extraction from adaptation field
    if (pid === this.pcrPid && hasAdaptation && packet[4] >= 7) {
      const flags = packet[5]
      if (flags & 0x10) {
        // PCR flag — base is already in 90kHz units (33-bit, split across bytes 6-10)
        const pcr90k =
          (packet[6] << 25) |
          (packet[7] << 17) |
          (packet[8] << 9) |
          (packet[9] << 1) |
          (packet[10] >> 7)
        if (this.firstPcr === 0) this.firstPcr = pcr90k
        this.emit('pcr', { pcr: pcr90k, firstPcr: this.firstPcr } as PcrEvent)
      }
    }

    if (pid === this.captionPid && hasPayload) {
      const payloadOffset = hasAdaptation ? 4 + 1 + packet[4] : 4
      const payload = packet.slice(payloadOffset)

      if (payloadUnitStart) {
        const existing = this.pesBuffer.get(pid)
        if (existing && existing.length > 9) {
          this.processCaptionPES(existing)
        }
        this.pesBuffer.set(pid, payload)
      } else {
        const existing = this.pesBuffer.get(pid)
        if (existing) {
          this.pesBuffer.set(pid, Buffer.concat([existing, payload]))
        }
      }
    }
  }

  private parsePAT(packet: Buffer, offset: number, payloadUnitStart: number): void {
    if (payloadUnitStart) offset += packet[offset] + 1 // pointer field
    // table_id = 0x00 for PAT
    if (packet[offset] !== 0x00) return
    const sectionLength = ((packet[offset + 1] & 0x0f) << 8) | packet[offset + 2]
    const end = offset + 3 + sectionLength - 4
    let pos = offset + 8
    while (pos + 3 < end) {
      const programNumber = (packet[pos] << 8) | packet[pos + 1]
      const pid = ((packet[pos + 2] & 0x1f) << 8) | packet[pos + 3]
      if (programNumber !== 0) {
        this.pmtPid = pid
        break
      }
      pos += 4
    }
  }

  private parsePMT(packet: Buffer, offset: number, payloadUnitStart: number): void {
    if (payloadUnitStart) offset += packet[offset] + 1
    if (packet[offset] !== 0x02) return // table_id for PMT
    const sectionLength = ((packet[offset + 1] & 0x0f) << 8) | packet[offset + 2]
    const end = offset + 3 + sectionLength - 4

    this.pcrPid = ((packet[offset + 8] & 0x1f) << 8) | packet[offset + 9]
    const programInfoLength = ((packet[offset + 10] & 0x0f) << 8) | packet[offset + 11]
    let pos = offset + 12 + programInfoLength

    while (pos + 4 < end) {
      const streamType = packet[pos]
      const elemPid = ((packet[pos + 1] & 0x1f) << 8) | packet[pos + 2]
      const esInfoLength = ((packet[pos + 3] & 0x0f) << 8) | packet[pos + 4]

      if (streamType === 0x06) {
        let descPos = pos + 5
        const descEnd = descPos + esInfoLength
        while (descPos + 1 < descEnd) {
          const descTag = packet[descPos]
          const descLen = packet[descPos + 1]
          if (descTag === 0x52 && descLen >= 1) {
            const componentTag = packet[descPos + 2]
            if (componentTag === 0x30 || componentTag === 0x87) {
              this.captionPid = elemPid
              this.pmtParsed = true
            }
          }
          descPos += 2 + descLen
        }
      }

      pos += 5 + esInfoLength
    }
  }

  private processCaptionPES(pes: Buffer): void {
    if (pes.length < 9) return
    const startCode = (pes[0] << 16) | (pes[1] << 8) | pes[2]
    if (startCode !== 0x000001) return

    let pts = 0
    const ptsDtsFlags = (pes[7] >> 6) & 3
    if (ptsDtsFlags & 2) {
      pts =
        ((pes[9] & 0x0e) << 29) |
        ((pes[10] & 0xff) << 22) |
        (((pes[11] & 0xfe) >> 1) << 15) |
        ((pes[12] & 0xff) << 7) |
        ((pes[13] & 0xfe) >> 1)
    }

    const headerDataLength = pes[8]
    const dataStart = 9 + headerDataLength
    if (dataStart >= pes.length) return

    const captionData = pes.slice(dataStart)
    if (captionData.length === 0) return

    this.emit('arib-data', {
      data: captionData.toString('base64'),
      pts,
    } as AribDataEvent)
  }
}
