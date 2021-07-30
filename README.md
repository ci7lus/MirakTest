<img src="https://i.gyazo.com/80257305e2201aa84839ab568c60b4cb.png" alt="MirakTest" width="400px" />

# MirakTest

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ci7lus/MirakTest)](https://github.com/ci7lus/MirakTest/releases)
[![CI](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml/badge.svg)](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml)

[Mirakurun](https://github.com/Chinachu/Mirakurun) 映像視聴確認用アプリ

## 概要

Electron を使用した Mirakurun の映像視聴確認用アプリです。鋭意開発中です。<br />

[![Image from Gyazo](https://i.gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2.jpg)](https://gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2)

[saya](https://github.com/SlashNephy/saya) を利用した実況コメントを流す機能もついています。

[![Image from Gyazo](https://i.gyazo.com/582a518d615e042394ade5fe7bcfcf3f.jpg)](https://gyazo.com/582a518d615e042394ade5fe7bcfcf3f)

macOS / Windows 版は [aribb24.js](https://github.com/monyone/aribb24.js) による字幕表示にも対応しています。

[![Image from Gyazo](https://i.gyazo.com/2f5f23d3c0e2968724dd2bce018cef86.jpg)](https://gyazo.com/2f5f23d3c0e2968724dd2bce018cef86)

> ©2020 プロジェクトラブライブ！虹ヶ咲学園スクールアイドル同好会

## 導入方法

### 安定版

macOS / Linux / Windows 版ビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

dmg をマウントして app を Applications にコピーします。<br />
Intel / M1 mac (Rosetta 2) 上で動作する macOS Catalina / Big Sur での動作を確認しています。<br />
必須ではありませんが、字幕の表示に [Rounded M+ 1m for ARIB](https://github.com/xtne6f/TVCaptionMod2/blob/3cc6c1767595e1973473124e892a57c7693c2154/TVCaptionMod2_Readme.txt#L49-L50) を指定しているので、フォントのインストールを推奨します。[ダウンロードはこちら](https://github.com/ci7lus/MirakTest/files/6555741/rounded-mplus-1m-arib.ttf.zip)。

#### Linux (debian) での実行

vlc の導入が必要です。

```bash
apt-get install vlc
```

AppImage に実行権限をつけ `--no-sandbox` をつけて実行するか、アーカイブ版の `chrome-sandbox` を適切な権限に設定してください（[参考](https://github.com/Revolutionary-Games/Thrive/issues/749)）。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます。

## 開発

メイン機能の依存として [WebChimera.js](https://github.com/RSATom/WebChimera.js) を利用しています。[Build PreRequests](https://github.com/RSATom/WebChimera.js#build-prerequisites) の導入が必要です。<br>

### macOS

```bash
brew install vlc cmake
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
./setup_libvlc_mac.sh
./setup_wcjs.sh
yarn build
```

[vlc-miraktest](https://github.com/vivid-lapin/vlc-miraktest) の [Releases](https://github.com/vivid-lapin/vlc-miraktest/releases) にある dmg から `VLC.app` を抽出し MirakTest ディレクトリに配置することで、ビルドが aribb24.js を用いるようになります。

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

```powershell
choco install -y cmake powershell-core
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn --ignore-scripts
pwsh ./setup_wcjs.ps1
yarn build
```

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [SlashNephy/saya](https://github.com/SlashNephy/saya)
- [monyone/aribb24.js](https://github.com/monyone/aribb24.js)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPLv2.1 または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。
