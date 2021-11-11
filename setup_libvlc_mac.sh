set -eu
rm -rf vlc_libs
if [ -d ./VLC.app ]; then
    BASE_PATH=./VLC.app
else
    BASE_PATH=/Applications/VLC.app
fi
echo "Using $BASE_PATH"
cp -Ra $BASE_PATH/Contents/MacOS/lib vlc_libs
mkdir vlc_libs/vlc
cp -Ra $BASE_PATH/Contents/MacOS/{plugins,share} vlc_libs/vlc
rm vlc_libs/vlc/plugins/libsecuretransport_plugin.dylib
rm -rf vlc_libs/vlc/share/locale
rm -rf vlc_libs/vlc/share/lua/playlist/*.luac
rm -rf node_modules/electron/dist/Electron.app/Contents/Frameworks/libvlc*.dylib
rm -rf node_modules/electron/dist/Electron.app/Contents/Frameworks/vlc
for d in vlc_libs/*; do cp -Ra $d node_modules/electron/dist/Electron.app/Contents/Frameworks; done
curl -sL https://raw.githubusercontent.com/videolan/vlc/master/COPYING > node_modules/electron/dist/Electron.app/Contents/VLC-COPYING
curl -sL https://raw.githubusercontent.com/videolan/vlc/master/COPYING.LIB > node_modules/electron/dist/Electron.app/Contents/VLC-COPYING.LIB