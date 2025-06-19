# Getting Started

Japan Map Selectorは、日本の都道府県・市区町村を選択できるインタラクティブな地図コンポーネントです。このガイドでは、基本的なセットアップ方法を説明します。

## 必要な環境

- Node.js 14以上
- モダンなブラウザ（Chrome、Firefox、Safari、Edge）

## インストール

### npm を使用する場合

```bash
npm install japan-map-selector
```

### CDN を使用する場合

```html
<script src="https://unpkg.com/japan-map-selector@latest/dist/index.js"></script>
```

## 基本的な使い方

### 1. HTML の準備

```html
<!DOCTYPE html>
<html>
<head>
  <title>Japan Map Selector Demo</title>
  <style>
    #map-container {
      width: 800px;
      height: 600px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
</body>
</html>
```

### 2. JavaScript での初期化

```javascript
import { JapanMapSelector } from 'japan-map-selector';

// 地図インスタンスを作成
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'default'
});

// 地理データを読み込む（デフォルトは中精度）
// パッケージに含まれるデータを使用
await map.initialize(
  './node_modules/japan-map-selector/src/data/simplified/prefectures-medium.geojson',
  './node_modules/japan-map-selector/src/data/simplified/municipalities-medium.geojson'
);

// コンテナに地図を描画
const container = document.getElementById('map-container');
// ここで実際の描画処理を行う（フレームワークに依存）
```

### 3. イベントの処理

```javascript
// 都道府県が選択されたとき
map.on('prefectureSelected', (prefecture) => {
  console.log(`${prefecture.name}が選択されました`);
  console.log(`都道府県コード: ${prefecture.code}`);
});

// 市区町村が選択されたとき
map.on('municipalitySelected', (municipality) => {
  console.log(`${municipality.name}が選択されました`);
  console.log(`市区町村コード: ${municipality.code}`);
});

// 状態が変更されたとき
map.on('stateChanged', (state) => {
  console.log('地図の状態が変更されました', state);
});
```

## React での使い方

```jsx
import React, { useEffect, useRef } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function App() {
  const handlePrefectureSelect = (prefecture) => {
    console.log('選択された都道府県:', prefecture.name);
  };

  const handleMunicipalitySelect = (municipality) => {
    console.log('選択された市区町村:', municipality.name);
  };

  return (
    <div>
      <h1>日本地図セレクター</h1>
      <JapanMapSelectorReact
        width={800}
        height={600}
        theme="colorful"
        prefectureDataUrl="/data/prefectures-medium.json"
        municipalityDataUrl="/data/municipalities-medium.json"
        onPrefectureSelect={handlePrefectureSelect}
        onMunicipalitySelect={handleMunicipalitySelect}
      />
    </div>
  );
}

export default App;
```

## Svelte での使い方

```svelte
<script>
  import JapanMapSelector from 'japan-map-selector/svelte';

  function handlePrefectureSelect(event) {
    const prefecture = event.detail;
    console.log('選択された都道府県:', prefecture.name);
  }

  function handleMunicipalitySelect(event) {
    const municipality = event.detail;
    console.log('選択された市区町村:', municipality.name);
  }
</script>

<div>
  <h1>日本地図セレクター</h1>
  <JapanMapSelector
    width={800}
    height={600}
    theme="colorful"
    prefectureDataUrl="/data/prefectures-medium.json"
    municipalityDataUrl="/data/municipalities-medium.json"
    on:prefectureSelect={handlePrefectureSelect}
    on:municipalitySelect={handleMunicipalitySelect}
  />
</div>
```

## データの準備

このパッケージには、中精度の地図データがデフォルトで含まれています。

### パッケージに含まれるデータの使用

```javascript
// Webpack、Viteなどのバンドラーを使用する場合
import prefectureData from 'japan-map-selector/src/data/simplified/prefectures-medium.geojson';
import municipalityData from 'japan-map-selector/src/data/simplified/municipalities-medium.geojson';

await map.initialize(prefectureData, municipalityData);
```

### CDNから直接読み込む場合

```javascript
// unpkgから読み込む（キャッシュが効くため2回目以降は高速）
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-medium.geojson',
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-medium.geojson'
);

// より高速な初回ロードが必要な場合は低精度データを使用
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-low.geojson'
);
```

### その他の精度レベル

より高精度または低精度のデータが必要な場合は、[データパッケージ](/guide/data-packages)のガイドを参照してください。

地図データは [smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography) を基に作成されています。

## 次のステップ

- [基本的な使い方](/guide/basic-usage) - より詳しい使用方法
- [カスタマイズ](/guide/customization) - 見た目や動作のカスタマイズ
- [テーマ](/guide/themes) - 利用可能なテーマと作成方法
- [API リファレンス](/api/core) - 詳細なAPI仕様