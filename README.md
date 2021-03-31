<img src="https://i.gyazo.com/80257305e2201aa84839ab568c60b4cb.png" alt="MirakTest" width="400px" />

# MirakTest

[Mirakurun](https://github.com/Chinachu/Mirakurun) 映像視聴確認用アプリ

## 概要

Electron を使用した Mirakurun の映像視聴確認用アプリです。鋭意開発中です。<br />

[![Image from Gyazo](https://i.gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2.jpg)](https://gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2)

[saya](https://github.com/SlashNephy/saya) を利用した実況コメントを流す機能もついています。

[![Image from Gyazo](https://i.gyazo.com/582a518d615e042394ade5fe7bcfcf3f.jpg)](https://gyazo.com/582a518d615e042394ade5fe7bcfcf3f)

## 導入方法

### 安定版

macOS / Linux 版ビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

dmg をマウントして app を Applications にコピーします。<br />
Intel / M1 mac (Rosetta 2) 上で動作する macOS Catalina / Big Sur での動作を確認しています。

#### Linux (debian) での実行

vlc の導入が必要です。

```bash
apt-get install vlc
```

AppImage に実行権限をつけ `--no-sandbox` をつけて実行するか、アーカイブ版の `chrome-sandbox` を適切な権限に設定してください（[参考](https://github.com/Revolutionary-Games/Thrive/issues/749)）。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます。現在は macOS / Linux ビルドのみです。

## 開発

メイン機能の依存として [WebChimera.js](https://github.com/RSATom/WebChimera.js) を利用しています。[Build PreRequests](https://github.com/RSATom/WebChimera.js#build-prerequisites) と [Prebuild binaries](https://github.com/RSATom/WebChimera.js#prebuilt-binaries) の導入が必要です。

### macOS

```bash
brew install vlc
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
./setup_vlclib_mac.sh
./setup_wcjs.sh
yarn build
```

### Linux (debian)

```bash
sudo apt-get install build-essential cmake libvlc-dev vlc
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
./setup_wcjs.sh
yarn build
```

### Windows

調査中

### 補足

Windows に関しては動作確認ができていません。動作確認ができた場合は、お知らせいただけると嬉しいです。

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [SlashNephy/saya](https://github.com/SlashNephy/saya)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPL または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。
