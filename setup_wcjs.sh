set -eu
cd node_modules/webchimera.js
git submodule update --init --recursive
if [ "${OS_NAME:-false}" = "macOS" ]; then cp -R /Applications/VLC.app ./deps; fi
if [[ "$npm_config_wcjs_runtime" = "electron" && "$npm_config_wcjs_runtime_version" = "latest" ]]; then export npm_config_wcjs_runtime_version=`yarn info electron version --silent`; fi
export WCJS_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_${npm_config_wcjs_runtime_version}_${npm_config_wcjs_arch}_${OS_NAME}.zip
export WCJS_ARCHIVE_PATH=$BUILD_DIR/$WCJS_ARCHIVE
export WCJS_FULL_ARCHIVE=WebChimera.js_${npm_config_wcjs_runtime}_v${npm_config_wcjs_runtime_version}_VLC_v${VLC_VER}_${npm_config_wcjs_arch}_${OS_NAME}.tar.gz
if [ "${OS_NAME:-false}" = "macOS" ]; then export WCJS_FULL_ARCHIVE_PATH=$BUILD_DIR/$WCJS_FULL_ARCHIVE; else export WCJS_FULL_ARCHIVE_PATH=$WCJS_ARCHIVE_PATH; fi
yarn install
mv ./build/Release/WebChimera.js.node .
rm -rf node_modules build deps/VLC.app
git submodule deinit --all
echo "module.exports = require('./WebChimera.js.node')" > index.js