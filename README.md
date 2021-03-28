<img src="https://i.gyazo.com/80257305e2201aa84839ab568c60b4cb.png" alt="MirakTest" width="400px" />

# MirakTest

\[WIP\] [Mirakurun](https://github.com/Chinachu/Mirakurun) 映像視聴確認用アプリ

## 概要

Electron を使用した Mirakurun の映像視聴確認用アプリです。鋭意開発中です。<br />

[![Image from Gyazo](https://i.gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2.jpg)](https://gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2)

[saya](https://github.com/SlashNephy/saya) を利用した実況コメントを流す機能もついています。

[![Image from Gyazo](https://i.gyazo.com/582a518d615e042394ade5fe7bcfcf3f.jpg)](https://gyazo.com/582a518d615e042394ade5fe7bcfcf3f)

## 導入方法

### 安定版

macOS / Linux ビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます。現在は macOS / Linux ビルドのみで、動作確認を行っているのは macOS のみです。

## 開発

メイン機能の依存として [WebChimera.js](https://github.com/RSATom/WebChimera.js) を利用しています。[Build PreRequests](https://github.com/RSATom/WebChimera.js#build-prerequisites) と [Prebuild binaries](https://github.com/RSATom/WebChimera.js#prebuilt-binaries) の導入が必要です。

### macOS

調査中

```bash
brew install vlc
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
yarn build
```

### Linux

調査中

```bash
sudo apt-get install build-essential cmake libvlc-dev
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
yarn build
```

### Windows

調査中

### 補足

Linux / Windows に関しては開発者が環境を持ち合わせていないため、動作確認ができません。該当環境にて動作確認ができた場合は、お知らせいただけると嬉しいです。マルチプラットフォームを名乗れるようになります。

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [SlashNephy/saya](https://github.com/SlashNephy/saya)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPL または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。
