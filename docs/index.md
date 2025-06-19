---
layout: home

hero:
  name: Japan Map Selector
  text: 日本の地図コンポーネント
  tagline: 都道府県・市区町村を選択できるインタラクティブな地図をWebアプリケーションに簡単に追加
  image:
    src: /images/map-preview.png
    alt: Japan Map Selector
  actions:
    - theme: brand
      text: はじめる
      link: /guide/getting-started
    - theme: alt
      text: デモを見る
      link: /demo

features:
  - title: 🗾 完全な日本地図
    details: 47都道府県と市区町村を含む詳細な地図データ。離島の表示切り替えも可能
  - title: 🎨 カスタマイズ可能
    details: 7種類のプリセットテーマとカスタムテーマのサポート。各都道府県・市区町村の色を個別に設定可能
  - title: ⚡ 高速・軽量
    details: TypeScriptで書かれた効率的なコード。4段階の簡略化レベルでファイルサイズを最適化
  - title: 🔧 フレームワーク対応
    details: React、Svelte、バニラJavaScriptで使用可能。フレームワーク非依存の設計
  - title: 🖱️ リッチな操作性
    details: ズーム、パン、ホバー、クリックなどWebGIS風の操作。マウスホイールやタッチ操作にも対応
  - title: 🎯 高度な機能
    details: グリッドベースのディフォルメ機能、選択可能な都道府県の制限、データ可視化への対応
---

## クイックスタート

```bash
npm install japan-map-selector
```

```javascript
import { JapanMapSelector } from 'japan-map-selector';

const map = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'colorful'
});

await map.initialize(
  '/data/prefectures.json',
  '/data/municipalities.json'
);

map.on('prefectureSelected', (prefecture) => {
  console.log('選択された都道府県:', prefecture.name);
});
```

## 特徴

### 📍 正確な地図データ
- [smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography)の簡略化された地理データを使用
- 都道府県境界と市区町村境界を正確に表現
- 実用的で見やすい地図表示

### 🎨 豊富なテーマ
- **デフォルト**: シンプルでクリーンなデザイン
- **ダーク**: ダークモード対応
- **カラフル**: 各都道府県に個別の色
- **ランダム**: 動的に生成される色
- その他、ウォーム、クール、モノクロームテーマ

### 🚀 パフォーマンス
- 4段階の簡略化レベル（original, high, medium, low, ultra-low）
- 必要に応じて詳細度を調整可能
- 大規模なWebアプリケーションでも高速に動作

## データの出典

このライブラリで使用している地理データは、国土交通省の国土数値情報を加工して作成しています。

- **出典**: 「国土数値情報（行政区域データ）」（国土交通省）
- **URL**: https://nlftp.mlit.go.jp/ksj/index.html
- 詳細は[出典表示について](/guide/attribution)をご確認ください

## サポート

- [GitHub Issues](https://github.com/yourusername/japan-map-selector/issues)で問題を報告
- [ディスカッション](https://github.com/yourusername/japan-map-selector/discussions)で質問や提案