# mirak — Architecture & Development Guide

## Overview

mirak is an Electron-based macOS application for viewing digital broadcasts via [Mirakurun](https://github.com/Chinachu/Mirakurun). It is structured as a research artifact focused on implementing a functional DTV viewer.

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React + Recoil |
| App shell | Electron |
| Video playback | mpv (via N-API NSView + JSON IPC) |
| Subtitles | aribb24.js (ARIB-STD-B24) + TsCaptionExtractor |
| Styling | Tailwind CSS |
| Build | Webpack + electron-builder |
| Language | TypeScript |

## Architecture

### Video Playback

mpv renders video directly to an NSView that sits behind the transparent Electron web layer. This allows the React UI (channel selector, subtitle overlay, controls) to float above the video without interfering with hardware-accelerated rendering.

Control of mpv is handled via a **JSON IPC socket**: mirak writes JSON commands to a Unix domain socket, and mpv responds with events and state updates over the same channel.

ARIB subtitles are extracted from the MPEG-TS stream by `TsCaptionExtractor` and rendered via `aribb24.js` in the Electron renderer process, overlaid on top of the mpv NSView.

### Process Structure

```
Electron Main Process
  └── mpv subprocess (NSView embedded, JSON IPC socket)

Electron Renderer Process
  └── React UI (transparent overlay over mpv NSView)
       └── aribb24.js subtitle renderer
```

### Native Addon

The native N-API addon lives in `native/mpv-nsview/` and is responsible for:
- Creating and embedding the NSView into the Electron BrowserWindow
- Launching mpv with the correct window ID and IPC socket path
- Forwarding resize/focus events from Electron to mpv

## Build Commands

```bash
# Install dependencies
yarn install

# Setup mpv dylibs (first time, macOS only)
./setup_mpv_mac.sh

# Build native addon (prerequisite before dev or release build)
cd native/mpv-nsview && npm install && npx node-gyp rebuild --arch=arm64
cd ../..

# Development
yarn dev:webpack   # run in a separate terminal
yarn dev:electron

# Production build
yarn build
```

## Directory Structure

```
src/
  atoms/          # Recoil state atoms
  components/     # React components
  main/           # Electron main process code
  renderer/       # Electron renderer process code
  types/          # TypeScript type definitions (including plugin API)
native/
  mpv-nsview/     # N-API native addon for mpv NSView embedding
```

## Platform Support

Currently macOS (Apple Silicon / aarch64) only. Linux and Windows support may be re-added after mpv cross-platform native addon work is complete.

## Plugin API

Plugins are loaded by the renderer process. The public API surface is defined in `src/types/plugin.ts`. A compiled `plugin.d.ts` type definition file is distributed alongside release builds.
