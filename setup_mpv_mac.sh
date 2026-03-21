#!/bin/bash
set -eu

echo "Setting up mpv for mirak..."
rm -rf mpv_libs
mkdir -p mpv_libs/bin mpv_libs/lib

# Check if mpv is installed via Homebrew
if ! command -v brew &>/dev/null; then
  echo "Error: Homebrew is required. Install from https://brew.sh"
  exit 1
fi

if ! brew list mpv &>/dev/null; then
  echo "Installing mpv via Homebrew..."
  brew install mpv
fi

# Also need dylibbundler to collect dylib dependencies
if ! brew list dylibbundler &>/dev/null; then
  echo "Installing dylibbundler..."
  brew install dylibbundler
fi

MPV_BIN="$(brew --prefix mpv)/bin/mpv"
echo "Using mpv at: $MPV_BIN"

cp "$MPV_BIN" mpv_libs/bin/mpv

# dylibbundler copies dependent dylibs and rewrites their install names
dylibbundler -od -b \
  -x mpv_libs/bin/mpv \
  -d mpv_libs/lib/ \
  -p @executable_path/../Frameworks/ \
  -ignore-system-libs

echo "Copying to Electron dev environment..."
cp mpv_libs/bin/mpv \
  node_modules/electron/dist/Electron.app/Contents/MacOS/mpv

cp mpv_libs/lib/*.dylib \
  node_modules/electron/dist/Electron.app/Contents/Frameworks/ 2>/dev/null || true

echo "mpv setup complete."
echo "mpv binary: $(file mpv_libs/bin/mpv)"
echo "Dylibs collected: $(ls mpv_libs/lib/ | wc -l)"
