# MirakTest

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/ci7lus/MirakTest?include_prereleases)](https://github.com/ci7lus/MirakTest/releases)
[![CI](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml/badge.svg)](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml)

[Mirakurun](https://github.com/Chinachu/Mirakurun) 用映像視聴アプリ実装研究資料

## 概要

MirakTest は macOS / Linux / Windows 上で Mirakurun を利用しデジタル放送を視聴するアプリの実装を研究する目的で配布される研究資料です。本アプリに CAS 処理は含まれていないため、デコードされていない放送データを視聴することは出来ません。<br />
macOS / Windows 版ビルドでは [aribb24.js](https://github.com/monyone/aribb24.js) による ARIB-STD-B24 形式の字幕表示に対応しています。<br />
プラグインを導入して機能を拡張することが出来ます。

## 導入方法

### 安定版

macOS / Linux / Windows 版ビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

対応するアーキテクチャの dmg をダウンロード後、マウントして app を Applications にコピーします。<br />
Intel / M1 mac (aarch64) 上で動作する macOS Monterey での動作を確認しています。<br />
標準では字幕の表示に [Rounded M+ 1m for ARIB](https://github.com/xtne6f/TVCaptionMod2/blob/3cc6c1767595e1973473124e892a57c7693c2154/TVCaptionMod2_Readme.txt#L49-L50) を指定しています。[ダウンロードはこちら](https://github.com/ci7lus/MirakTest/files/6555741/rounded-mplus-1m-arib.ttf.zip)。

#### Linux (debian) での実行

vlc の導入が必要です。

```bash
apt-get install vlc
```

AppImage に実行権限をつけ `--no-sandbox` をつけて実行するか、アーカイブ版の `chrome-sandbox` を適切な権限に設定してください（[参考](https://github.com/Revolutionary-Games/Thrive/issues/749)）。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます（ログインが必要です）。

## プラグイン

プラグインを導入して機能を拡張することが出来ます。<br />
利用できるプラグインの一覧は[こちら](https://github.com/ci7lus/MirakTest/wiki/Userland-Plugin)。<br />
API 仕様は[plugin.ts](./src/types/plugin.ts)を参照してください。<br />
型定義ファイル(`plugin.d.ts`)はリリースにてアプリイメージと一緒に配布しています。

## 開発

依存として WebChimera.js を利用しているので、関連依存の導入が必要です（下記手順に含まれています）。

### macOS

```bash
brew install vlc cmake
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
./setup_libvlc_mac.sh
./setup_wcjs.sh
yarn build:tsc
yarn dev:webpack
yarn dev:electron
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
yarn build:tsc
yarn dev:webpack
yarn dev:electron
yarn build
```

### Windows

```powershell
choco install -y cmake powershell-core
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn --ignore-scripts
pwsh ./setup_wcjs.ps1
yarn build:tsc
yarn dev:webpack
yarn dev:electron
yarn build
```

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [monyone/aribb24.js](https://github.com/monyone/aribb24.js)
- [tsukumijima/KonomiTV](https://github.com/tsukumijima/KonomiTV)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPLv2.1 または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。
