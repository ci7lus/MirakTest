$ARCH = "x64"
$OS_NAME = "win"
$RUNTIME = "electron"
$RUNTIME_VER = "11.1.0"
$VLC_VER = "3.0.11"
$WCJS_VER = "0.3.1"

Set-Location "node_modules"

Invoke-WebRequest -Uri "https://github.com/RSATom/WebChimera.js/releases/download/v${WCJS_VER}/WebChimera.js_v${WCJS_VER}_${RUNTIME}_v${RUNTIME_VER}_VLC_v${VLC_VER}_${ARCH}_${OS_NAME}.zip" -OutFile "wcjs.zip"
Expand-Archive -Path "wcjs.zip" -DestinationPath "." -Force
Remove-Item "wcjs.zip"

@"
module.exports = {
    ...require('./WebChimera.js.node'),
    path: __dirname.replace('app.asar', 'app.asar.unpacked')
}
"@ | Set-Content "webchimera.js/index.js" -Encoding UTF8

Set-Location ".."
