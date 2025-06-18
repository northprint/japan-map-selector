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

// 地理データを読み込む
await map.initialize(
  '/path/to/prefectures.json',
  '/path/to/municipalities.json'
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
        prefectureDataUrl="/data/prefectures.json"
        municipalityDataUrl="/data/municipalities.json"
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
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
    on:prefectureSelect={handlePrefectureSelect}
    on:municipalitySelect={handleMunicipalitySelect}
  />
</div>
```

## データの準備

地図データは [smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography) から取得できます。

必要なファイル：
- `prefectures.json` - 都道府県の境界データ
- `municipalities.json` - 市区町村の境界データ

これらのファイルを適切な場所に配置し、URLを指定してください。

## 次のステップ

- [基本的な使い方](/guide/basic-usage) - より詳しい使用方法
- [カスタマイズ](/guide/customization) - 見た目や動作のカスタマイズ
- [テーマ](/guide/themes) - 利用可能なテーマと作成方法
- [API リファレンス](/api/core) - 詳細なAPI仕様