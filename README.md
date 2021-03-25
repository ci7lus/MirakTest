<img src="https://i.gyazo.com/80257305e2201aa84839ab568c60b4cb.png" alt="MirakTest" width="400px" />

# MirakTest

\[WIP\] [Mirakurun](https://github.com/Chinachu/Mirakurun) 映像視聴確認用アプリ

## 概要

Electron を使用した Mirakurun の映像視聴確認用アプリです。鋭意開発中です。<br />

[![Image from Gyazo](https://i.gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2.jpg)](https://gyazo.com/bddde5c07be29c548ad9a10f16a1d5c2)

[saya](https://github.com/SlashNephy/saya) を利用した実況コメントを流す機能もついています。

[![Image from Gyazo](https://i.gyazo.com/582a518d615e042394ade5fe7bcfcf3f.jpg)](https://gyazo.com/582a518d615e042394ade5fe7bcfcf3f)

## 使用方法

現状ビルド済みアプリの配布は行っていないので、下記開発手順よりビルドを行ってください。

## 開発

yarn が失敗する場合は `--ignore-scripts` をつけてみてください。<br />
メイン機能の依存として [WebChimera.js](https://github.com/RSATom/WebChimera.js) を利用しています。[Build PreRequests](https://github.com/RSATom/WebChimera.js#build-prerequisites) と [Prebuild binaries](https://github.com/RSATom/WebChimera.js#prebuilt-binaries) の導入が必要です。<br />

### macOS

```bash
brew install vlc
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
yarn build
```

### Linux

調査中

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

MirakTest は MIT ライセンスの下で提供されます。
