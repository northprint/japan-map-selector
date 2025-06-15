# 日本地図セレクター (Japan Map Selector)

日本の都道府県と市区町村を選択できるTypeScriptベースのコンポーネントライブラリです。React、Svelte、Vanilla JavaScriptで使用できます。

## 特徴

- 🗾 日本全国の都道府県・市区町村の選択UI
- 🎨 カスタマイズ可能な色設定
- 🚀 軽量でパフォーマンスが高い
- 📦 TypeScript完全対応
- ⚛️ React/Svelte/Vanilla JS対応

## インストール

```bash
npm install japan-map-selector
```

## 必要なデータ

このライブラリを使用するには、[smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography)から地理データをダウンロードする必要があります。

### データのダウンロード方法

```bash
# 都道府県データ
curl -L https://raw.githubusercontent.com/smartnews-smri/japan-topography/master/data/prefecture/geojson/s0010/all.geojson -o src/data/prefectures.geojson

# 市区町村データ
curl -L https://raw.githubusercontent.com/smartnews-smri/japan-topography/master/data/municipality/geojson/s0010/all.geojson -o src/data/municipalities.geojson
```

## 使用方法

### Vanilla JavaScript

```javascript
import { JapanMapSelector } from 'japan-map-selector';

const selector = new JapanMapSelector({
  onPrefectureSelect: (prefecture) => {
    console.log('選択された都道府県:', prefecture.name);
  },
  onMunicipalitySelect: (municipality) => {
    console.log('選択された市区町村:', municipality.name);
  }
});

// データの読み込み
await selector.initialize(
  './data/prefectures.geojson',
  './data/municipalities.geojson'
);

// 状態変更の監視
selector.on('stateChanged', (state) => {
  // UIを更新
});
```

### React

```jsx
import { ReactJapanMapSelector } from 'japan-map-selector';

function App() {
  return (
    <ReactJapanMapSelector
      prefectureDataUrl="./data/prefectures.geojson"
      municipalityDataUrl="./data/municipalities.geojson"
      onPrefectureSelect={(prefecture) => {
        console.log('選択された都道府県:', prefecture.name);
      }}
      onMunicipalitySelect={(municipality) => {
        console.log('選択された市区町村:', municipality.name);
      }}
    />
  );
}
```

### Svelte

```svelte
<script>
  import JapanMapSelector from 'japan-map-selector/svelte/JapanMapSelector.svelte';
</script>

<JapanMapSelector
  prefectureDataUrl="./data/prefectures.geojson"
  municipalityDataUrl="./data/municipalities.geojson"
  on:prefectureSelect={(e) => {
    console.log('選択された都道府県:', e.detail.name);
  }}
  on:municipalitySelect={(e) => {
    console.log('選択された市区町村:', e.detail.name);
  }}
/>
```

## API

### プロパティ

| プロパティ | 型 | デフォルト値 | 説明 |
|----------|---|------------|-----|
| `width` | number | 800 | SVGの幅 |
| `height` | number | 600 | SVGの高さ |
| `prefectureColor` | string | '#e0e0e0' | 都道府県の色 |
| `prefectureHoverColor` | string | '#c0c0c0' | 都道府県のホバー色 |
| `municipalityColor` | string | '#f0f0f0' | 市区町村の色 |
| `municipalityHoverColor` | string | '#d0d0d0' | 市区町村のホバー色 |
| `onPrefectureSelect` | function | - | 都道府県選択時のコールバック |
| `onMunicipalitySelect` | function | - | 市区町村選択時のコールバック |

### メソッド（コアクラス）

- `initialize(prefectureDataUrl, municipalityDataUrl)`: データを読み込んで初期化
- `selectPrefecture(code)`: 都道府県を選択
- `selectMunicipality(code)`: 市区町村を選択
- `resetView()`: 全国表示に戻る
- `getPrefectures()`: 都道府県一覧を取得
- `getSelectedMunicipalities()`: 選択中の都道府県の市区町村一覧を取得

## ライセンス

MIT