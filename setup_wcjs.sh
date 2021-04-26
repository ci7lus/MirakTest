set -eu
export VLC_VER=3.0.12
export ELECTRON_VER="$(yarn info electron version --silent)"
export BUILD_DIR="./build/Release"
export npm_config_wcjs_runtime=electron
export npm_config_wcjs_runtime_version=$ELECTRON_VER
export npm_config_wcjs_arch=x64
export OS_NAME="$(uname)"
cd node_modules/webchimera.js

function finally {
  echo "Cleanup"
  rm -rf node_modules build deps/VLC.app
  git submodule deinit --all
}
trap finally EXIT

git submodule update --init --recursive
if [ "$OS_NAME" = "Darwin" ]; then cp -R /Applications/VLC.app ./deps; fi
export WCJS_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_${npm_config_wcjs_runtime_version}_${npm_config_wcjs_arch}_${OS_NAME}.zip
export WCJS_ARCHIVE_PATH=$BUILD_DIR/$WCJS_ARCHIVE
export WCJS_FULL_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_v${npm_config_wcjs_runtime_version}_VLC_v${VLC_VER}_${npm_config_wcjs_arch}_${OS_NAME}.tar.gz
if [ "$OS_NAME" = "Darwin" ]; then export WCJS_FULL_ARCHIVE_PATH=$BUILD_DIR/$WCJS_FULL_ARCHIVE; else export WCJS_FULL_ARCHIVE_PATH=$WCJS_ARCHIVE_PATH; fi
yarn install
mv ./build/Release/WebChimera.js.node .
echo "module.exports = require('./WebChimera.js.node')" > index.js
sed -i -e "s/node rebuild.js/echo skip rebuild/" package.json