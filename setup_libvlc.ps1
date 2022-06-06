$LIBVLC_VER = "3.0.17.2"
$OS_NAME = "windows"

# Setup VLC
Set-Location "node_modules"
Invoke-WebRequest -Uri "https://github.com/vivid-lapin/vlc-miraktest/releases/download/${LIBVLC_VER}/vlc-${OS_NAME}-${LIBVLC_VER}.zip" -OutFile "libvlc.zip"
Expand-Archive -Path ".\libvlc.zip" -DestinationPath ".\webchimera.js" -Force
Remove-Item ".\libvlc.zip"
Set-Location ".."
