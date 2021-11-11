$LIBVLC_VER = "3.0.16"
$LIBVLC_VER_EXTRA = "3"
$OS_NAME = "windows"

# Setup VLC
Set-Location "node_modules"
Invoke-WebRequest -Uri "https://github.com/vivid-lapin/vlc-miraktest/releases/download/${LIBVLC_VER}.${LIBVLC_VER_EXTRA}/vlc-${OS_NAME}-${LIBVLC_VER}.zip" -OutFile "libvlc.zip"
Expand-Archive -Path ".\libvlc.zip" -DestinationPath ".\webchimera.js" -Force
Remove-Item ".\libvlc.zip"
Set-Location ".."
