# mirak

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/ci7lus/MirakTest?include_prereleases)](https://github.com/ci7lus/MirakTest/releases)
[![CI](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml/badge.svg)](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml)

[Mirakurun](https://github.com/Chinachu/Mirakurun) 用映像視聴アプリ実装研究資料<br />

## 概要

mirak は macOS 上で Mirakurun を利用しデジタル放送を視聴するアプリの実装を研究する目的で配布される研究資料です。本アプリに CAS 処理は含まれていないため、デコードされていない放送データを視聴することは出来ません。<br />
[aribb24.js](https://github.com/monyone/aribb24.js) による ARIB-STD-B24 形式の字幕表示に対応しています。<br />
プラグインを導入して機能を拡張することが出来ます。

## 導入方法

### 安定版

macOS 向けビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

```sh
brew install --cask ci7lus/miraktest/miraktest
```

Apple Silicon mac (aarch64) 上で動作する macOS Ventura 以降での動作を確認しています。<br />

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

## 開発セットアップ

### 必要なもの
- macOS (Apple Silicon)
- Node.js 16+
- Yarn 3.3.1+
- Homebrew

### セットアップ手順

```bash
# リポジトリのクローン
git clone <this-repo>
cd mirak

# 依存関係のインストール
yarn install

# mpv のセットアップ（初回のみ）
./setup_mpv_mac.sh

# ネイティブアドオンのビルド
cd native/mpv-nsview && npm install && npx node-gyp rebuild --arch=arm64 && cd ../..

# 開発サーバー起動
yarn dev:webpack  # 別ターミナルで
yarn dev:electron
```

### ビルド

```bash
yarn build
```

## 謝辞

mirak は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [mpv-player/mpv](https://github.com/mpv-player/mpv)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [monyone/aribb24.js](https://github.com/monyone/aribb24.js)
- [tsukumijima/KonomiTV](https://github.com/tsukumijima/KonomiTV)

DTV コミュニティの皆さまに感謝します。

## ライセンス

mirak のソースコードは MIT ライセンスの下で提供されます。
