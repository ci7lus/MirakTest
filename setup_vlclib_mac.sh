set -eu
rm -rf vlc_libs
cp -Ra /Applications/VLC.app/Contents/MacOS/lib vlc_libs
mkdir vlc_libs/vlc
cp -Ra /Applications/VLC.app/Contents/MacOS/{plugins,share} vlc_libs/vlc
rm -rf vlc_libs/vlc/share/locale
rm -rf node_modules/electron/dist/Electron.app/Contents/Frameworks/libvlc*.dylib
rm -rf node_modules/electron/dist/Electron.app/Contents/Frameworks/vlc
for d in vlc_libs/*; do cp -Ra $d node_modules/electron/dist/Electron.app/Contents/Frameworks; done
curl https://raw.githubusercontent.com/videolan/vlc/master/COPYING > node_modules/electron/dist/Electron.app/Contents/VLC-COPYING
curl https://raw.githubusercontent.com/videolan/vlc/master/COPYING.LIB > node_modules/electron/dist/Electron.app/Contents/VLC-COPYING.LIB