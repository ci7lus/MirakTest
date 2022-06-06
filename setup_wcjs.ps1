$LIBVLC_VER = "3.0.16"
$LIBVLC_VER_EXTRA = "3"
$OS_NAME = "windows"

$ELECTRON_VERSION = (yarn run --silent electron --version) | Out-String

$Env:YARN_ENABLE_IMMUTABLE_INSTALLS = "false"
$Env:npm_config_wcjs_runtime = "electron"
$Env:npm_config_wcjs_runtime_version = $ELECTRON_VERSION.Replace("v", "") -replace "`t|`n|`r",""
$Env:npm_config_wcjs_arch = "x64"
$Env:ELECTRON_MIRROR = "https://artifacts.electronjs.org/headers/dist"

# Setup WebChimera.js
Set-Location "node_modules\webchimera.js"

function TryRemove {
    param($file)
    if (Test-Path $file) {
        Remove-Item $file -Force -Recurse
    }
}

function onExit {
    TryRemove ".\.yarn"
    TryRemove ".\node_modules"
    TryRemove ".\build"
    TryRemove ".\deps\vlc-${LIBVLC_VER}"
    TryRemove ".\yarn.lock"
    Set-Location "..\.."
}

Register-EngineEvent PowerShell.Exiting -Action {
    onExit
}
onExit
Set-Location "node_modules\webchimera.js"

Invoke-WebRequest -Uri "https://github.com/vivid-lapin/vlc-miraktest/releases/download/${LIBVLC_VER}.${LIBVLC_VER_EXTRA}/vlc-${OS_NAME}-${LIBVLC_VER}.zip" -OutFile "libvlc.zip"
Expand-Archive -Path ".\libvlc.zip" -DestinationPath ".\deps\vlc-${LIBVLC_VER}" -Force
Remove-Item ".\libvlc.zip"
Write-Output "nodeLinker: node-modules" | Set-Content ".\.yarnrc.yml"
Write-Output "" | Set-Content ".\yarn.lock"
yarn install
node rebuild.js
@"
    module.exports = {
        ...require('./WebChimera.js.node'),
        path: __dirname.replace('app.asar', 'app.asar.unpacked')
    }
"@ | Set-Content ".\index.js"
Copy-Item .\build\Release\WebChimera.js.node .