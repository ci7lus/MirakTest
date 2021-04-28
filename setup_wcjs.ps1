$ARCH = "x64"
$OS_NAME = "win"
$RUNTIME = "electron"
$RUNTIME_VER = "11.1.0"
$VLC_VER = "3.0.11"
$WCJS_VER = "0.3.1"

function InsertAfter ([string]$file, [string]$needle, [string]$text, [string]$encoding = "utf8NoBOM") {
    $data = Get-Content "$file"
    $lnum = $(Select-String -pattern "$needle" -path "$file" | ForEach-Object { $_.ToString().split(":")[2] } ) - 1
    If ($lnum -ne -1) {
        $data[$lnum] = $data[$lnum] + "`n$text"
        $data -Join "`n" | Out-File "$file" -Encoding "$encoding" -NoNewline
    }
}

function ReplaceOne ([string]$file, [string]$needle, [string]$text, [string]$encoding = "utf8NoBOM") {
    $data = Get-Content "$file" | ForEach-Object { $_ -replace "$needle", "$text" }
    $data -Join "`n" | Out-File "$file" -Encoding "$encoding" -NoNewline
}

# Setup Electron 11
yarn add -D --ignore-scripts electron@^11
InsertAfter ".\electron-builder.yml" "afterPack:" "electronVersion: `"11.1.0`""
ReplaceOne ".\package.json" "`"browserslist`": .+" "`"browserslist`": `"electron 11.1.0`""
ReplaceOne ".\package.json" "`"runtimeVersion`": .+" "`"runtimeVersion`": `"11.1.0`""

# Setup WebChimera.js
Set-Location "node_modules"
Invoke-WebRequest -Uri "https://github.com/RSATom/WebChimera.js/releases/download/v${WCJS_VER}/WebChimera.js_v${WCJS_VER}_${RUNTIME}_v${RUNTIME_VER}_VLC_v${VLC_VER}_${ARCH}_${OS_NAME}.zip" -OutFile "wcjs.zip"
Expand-Archive -Path ".\wcjs.zip" -DestinationPath "." -Force
Remove-Item ".\wcjs.zip"
@"
    module.exports = {
        ...require('./WebChimera.js.node'),
        path: __dirname.replace('app.asar', 'app.asar.unpacked')
    }
"@ | Set-Content ".\webchimera.js\index.js"

Set-Location ".."
