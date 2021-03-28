cp -Ra /Applications/VLC.app/Contents/MacOS/lib vlc_libs
mkdir vlc_libs/vlc
cp -Ra /Applications/VLC.app/Contents/MacOS/{plugins,share} vlc_libs/vlc
rm -rf vlc_libs/vlc/share/locale