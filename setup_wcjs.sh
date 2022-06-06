set -eu
export ELECTRON_VER="$(yarn run --silent electron --version | sed -e "s/v//")"
export BUILD_DIR="./build/Release"
export npm_config_wcjs_runtime=electron
export npm_config_wcjs_runtime_version=$ELECTRON_VER
export npm_config_wcjs_arch="$(arch | sed -e "s/i386/x64/")"
export ELECTRON_MIRROR="https://artifacts.electronjs.org/headers/dist"
export OS_NAME="$(uname)"
cd node_modules/webchimera.js

function finally {
  echo "Cleanup"
  rm -rf node_modules build deps/VLC.app yarn.lock .yarn
}
trap finally EXIT
finally

if [ "$OS_NAME" = "Darwin" ]; then
  if [ -d "../../VLC.app" ]; then
    echo "Using ./VLC.app"
    cp -Ra ../../VLC.app ./deps;
  else
    echo "Using /Application/VLC.app"
    cp -Ra /Applications/VLC.app ./deps;
  fi
fi
export WCJS_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_${npm_config_wcjs_runtime_version}_${npm_config_wcjs_arch}_${OS_NAME}.zip
export WCJS_ARCHIVE_PATH=$BUILD_DIR/$WCJS_ARCHIVE
export WCJS_FULL_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_v${npm_config_wcjs_runtime_version}_VLC_${npm_config_wcjs_arch}_${OS_NAME}.tar.gz
if [ "$OS_NAME" = "Darwin" ]; then export WCJS_FULL_ARCHIVE_PATH=$BUILD_DIR/$WCJS_FULL_ARCHIVE; else export WCJS_FULL_ARCHIVE_PATH=$WCJS_ARCHIVE_PATH; fi
echo 'nodeLinker: node-modules' > .yarnrc.yml
echo '' > yarn.lock
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install
if ! grep -q rebuild.js package.json; then
  node rebuild.js
fi
mv ./build/Release/WebChimera.js.node .
echo "module.exports = require('./WebChimera.js.node')" > index.js