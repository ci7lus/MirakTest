# MirakTest

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/ci7lus/MirakTest?include_prereleases)](https://github.com/ci7lus/MirakTest/releases)
[![CI](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml/badge.svg)](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml)

[Mirakurun](https://github.com/Chinachu/Mirakurun) 用映像視聴アプリ実装研究資料<br />

## 概要

MirakTest は macOS / Windows / Linux 上で Mirakurun を利用しデジタル放送を視聴するアプリの実装を研究する目的で配布される研究資料です。本アプリに CAS 処理は含まれていないため、デコードされていない放送データを視聴することは出来ません。<br />
macOS / Windows 版ビルドでは [aribb24.js](https://github.com/monyone/aribb24.js) による ARIB-STD-B24 形式の字幕表示に対応しています。<br />
プラグインを導入して機能を拡張することが出来ます。

## 導入方法

### 安定版

各 OS 向けビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

```sh
brew install --cask ci7lus/miraktest/miraktest
```

Intel / Apple Silicon mac (aarch64) 上で動作する macOS Monterey / Ventura での動作を確認しています。<br />

#### Windows での実行

exe のインストーラーをダウンロードして実行するか、zip を解凍して使用してください。<br />
Windows 11 での動作を確認しています。

#### Linux での実行

実験的なサポートのため、環境によっては正しく動作しない可能性があります。Issue で詳細なレポートをいただければ対応できるかもしれませんが、保証はできません。<br />
vlc の導入が必要です。debian の場合は以下のコマンドでインストールできます。

```bash
apt-get install vlc
```

AppImage に実行権限と `--no-sandbox` をつけて実行するか、アーカイブ版の `chrome-sandbox` を適切な権限に設定してください（[参考](https://github.com/Revolutionary-Games/Thrive/issues/749)）。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます（ログインが必要です）。

## 機能

### プラグイン

プラグインを導入して機能を拡張することが出来ます。<br />
利用できるプラグインの一覧は[こちら](https://github.com/ci7lus/MirakTest/wiki/Userland-Plugin)。<br />
API 仕様は[plugin.ts](./src/types/plugin.ts)を参照してください。<br />
型定義ファイル(`plugin.d.ts`)はリリースにてアプリイメージと一緒に配布しています。

### 操作

- [キーボードショートカット](https://github.com/ci7lus/MirakTest/wiki/%E3%82%AD%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88)

## 開発

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

### Windows

```powershell
choco install -y cmake powershell-core
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
pwsh .\setup_wcjs.ps1
yarn build:tsc
yarn dev:webpack
yarn dev:electron
yarn build
```

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

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [RSATom/WebChimera.js](https://github.com/RSATom/WebChimera.js)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [monyone/aribb24.js](https://github.com/monyone/aribb24.js)
- [tsukumijima/KonomiTV](https://github.com/tsukumijima/KonomiTV)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPLv2.1 または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。
