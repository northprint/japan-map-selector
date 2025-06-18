# React コンポーネント API

`JapanMapSelectorReact`コンポーネントのAPIリファレンスです。

## インポート

```javascript
import { JapanMapSelectorReact } from 'japan-map-selector/react';
```

## Props

### 必須Props

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `prefectureDataUrl` | `string` | 都道府県データのJSONファイルURL |
| `municipalityDataUrl` | `string` | 市区町村データのJSONファイルURL |

### オプションProps

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|------------|------|
| `width` | `number` | `800` | 地図の幅（ピクセル） |
| `height` | `number` | `600` | 地図の高さ（ピクセル） |
| `theme` | `string \| ColorTheme` | `'default'` | カラーテーマ |
| `onPrefectureSelect` | `(prefecture: Prefecture) => void` | - | 都道府県選択時のコールバック |
| `onMunicipalitySelect` | `(municipality: Municipality) => void` | - | 市区町村選択時のコールバック |
| `selectedPrefectureCode` | `string` | - | 初期選択都道府県コード |
| `selectedMunicipalityCode` | `string` | - | 初期選択市区町村コード |
| `selectablePrefectures` | `string[]` | - | 選択可能な都道府県コードの配列 |
| `disabledPrefectureFill` | `string` | `'#cccccc'` | 選択不可都道府県の塗りつぶし色 |
| `disabledPrefectureStroke` | `string` | `'#999999'` | 選択不可都道府県の枠線色 |
| `simplificationLevel` | `'original' \| 'high' \| 'medium' \| 'low' \| 'ultra-low'` | `'original'` | ポリゴンの簡略化レベル |
| `showAttribution` | `boolean` | `true` | 出典表示の有無 |
| `attributionOptions` | `AttributionOptions` | - | 出典表示のオプション |

### カラーカスタマイズProps

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `prefectureColor` | `string` | 都道府県の塗りつぶし色 |
| `prefectureHoverColor` | `string` | 都道府県のホバー色 |
| `municipalityColor` | `string` | 市区町村の塗りつぶし色 |
| `municipalityHoverColor` | `string` | 市区町村のホバー色 |

## メソッド（ref経由）

コンポーネントのrefを通じて以下のメソッドにアクセスできます：

```jsx
const mapRef = useRef();

// 使用例
mapRef.current.resetView();
```

### 利用可能なメソッド

| メソッド | 説明 | パラメータ |
|----------|------|------------|
| `resetView()` | 日本全体ビューに戻る | なし |
| `selectPrefecture(code)` | 都道府県を選択 | `code: string` |
| `selectMunicipality(code)` | 市区町村を選択 | `code: string` |
| `setTheme(theme)` | テーマを変更 | `theme: string \| ColorTheme` |
| `setDeformMode(mode, gridSize)` | ディフォルメモードを設定 | `mode: 'none' \| 'grid' \| 'hexagon'`, `gridSize?: number` |
| `getPrefectures()` | 都道府県一覧を取得 | なし |
| `getSelectedMunicipalities()` | 選択中の都道府県の市区町村一覧を取得 | なし |

## 型定義

### Prefecture

```typescript
interface Prefecture {
  code: string;        // 都道府県コード
  name: string;        // 都道府県名
  bounds: [[number, number], [number, number]]; // 境界ボックス
  feature: GeoJSONFeature;
}
```

### Municipality

```typescript
interface Municipality {
  code: string;         // 市区町村コード
  name: string;         // 市区町村名
  prefectureCode: string; // 都道府県コード
  feature: GeoJSONFeature;
}
```

### ColorTheme

```typescript
interface ColorTheme {
  name?: string;
  prefectureFill: string;
  prefectureStroke: string;
  prefectureHoverFill: string;
  prefectureSelectedFill: string;
  municipalityFill: string;
  municipalityStroke: string;
  municipalityHoverFill: string;
  municipalitySelectedFill: string;
  backgroundColor: string;
  strokeWidth: number;
}
```

### AttributionOptions

```typescript
interface AttributionOptions {
  showLink?: boolean;    // リンクを表示するか
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
}
```

## 使用例

### 基本的な使用

```jsx
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function App() {
  const handlePrefectureSelect = (prefecture) => {
    console.log('選択された都道府県:', prefecture.name);
  };

  const handleMunicipalitySelect = (municipality) => {
    console.log('選択された市区町村:', municipality.name);
  };

  return (
    <JapanMapSelectorReact
      width={800}
      height={600}
      theme="colorful"
      prefectureDataUrl="/data/prefectures.json"
      municipalityDataUrl="/data/municipalities.json"
      onPrefectureSelect={handlePrefectureSelect}
      onMunicipalitySelect={handleMunicipalitySelect}
    />
  );
}
```

### refを使った制御

```jsx
import { useRef } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithControls() {
  const mapRef = useRef();

  const handleReset = () => {
    mapRef.current?.resetView();
  };

  const selectTokyo = () => {
    mapRef.current?.selectPrefecture('13');
  };

  return (
    <>
      <div>
        <button onClick={handleReset}>リセット</button>
        <button onClick={selectTokyo}>東京都を選択</button>
      </div>
      <JapanMapSelectorReact
        ref={mapRef}
        prefectureDataUrl="/data/prefectures.json"
        municipalityDataUrl="/data/municipalities.json"
      />
    </>
  );
}
```

### カスタムテーマ

```jsx
const customTheme = {
  name: 'ocean',
  prefectureFill: '#0077be',
  prefectureStroke: '#005a9e',
  prefectureHoverFill: '#0099cc',
  prefectureSelectedFill: '#00bfff',
  municipalityFill: '#87ceeb',
  municipalityStroke: '#4682b4',
  municipalityHoverFill: '#add8e6',
  municipalitySelectedFill: '#b0e0e6',
  backgroundColor: '#f0f8ff',
  strokeWidth: 1.5
};

<JapanMapSelectorReact
  theme={customTheme}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>