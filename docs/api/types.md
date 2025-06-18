# 型定義

Japan Map Selectorで使用される主要な型定義のリファレンスです。

## 基本的な型

### Prefecture

都道府県を表す型です。

```typescript
interface Prefecture {
  code: string;        // 都道府県コード（例: '13'）
  name: string;        // 都道府県名（例: '東京都'）
  bounds: [[number, number], [number, number]]; // [[西経, 南緯], [東経, 北緯]]
  feature: GeoJSONFeature; // GeoJSONフィーチャー
}
```

### Municipality

市区町村を表す型です。

```typescript
interface Municipality {
  code: string;         // 市区町村コード（例: '13101'）
  name: string;         // 市区町村名（例: '千代田区'）
  prefectureCode: string; // 都道府県コード（例: '13'）
  feature: GeoJSONFeature; // GeoJSONフィーチャー
}
```

## GeoJSON関連の型

### GeoJSONFeature

地理的フィーチャーを表す型です。

```typescript
interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    N03_001: string;  // 都道府県名
    N03_002?: string; // 支庁名（オプション）
    N03_003?: string; // 郡・政令都市名（オプション）
    N03_004?: string; // 市区町村名（オプション）
    N03_007: string;  // 行政区域コード
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}
```

### GeoJSONFeatureCollection

フィーチャーのコレクションを表す型です。

```typescript
interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
```

## コンポーネントの型

### JapanMapSelectorProps

コンポーネントのプロパティを定義する型です。

```typescript
interface JapanMapSelectorProps {
  // コールバック
  onPrefectureSelect?: (prefecture: Prefecture) => void;
  onMunicipalitySelect?: (municipality: Municipality) => void;
  
  // サイズ
  width?: number;
  height?: number;
  
  // テーマ
  theme?: ColorTheme | ThemePreset;
  
  // カラーカスタマイズ（themeより優先）
  prefectureColor?: string;
  prefectureHoverColor?: string;
  municipalityColor?: string;
  municipalityHoverColor?: string;
  
  // 選択状態
  selectedPrefectureCode?: string;
  selectedMunicipalityCode?: string;
  
  // 選択制限
  selectablePrefectures?: string[];
  disabledPrefectureFill?: string;
  disabledPrefectureStroke?: string;
  
  // 簡略化
  simplificationLevel?: SimplificationLevel;
  
  // 出典表示
  showAttribution?: boolean;
  attributionOptions?: AttributionOptions;
}
```

### ThemePreset

プリセットテーマの名前を表す型です。

```typescript
type ThemePreset = 
  | 'default' 
  | 'dark' 
  | 'warm' 
  | 'cool' 
  | 'monochrome' 
  | 'colorful' 
  | 'random';
```

### SimplificationLevel

ポリゴンの簡略化レベルを表す型です。

```typescript
type SimplificationLevel = 
  | 'original'    // 元のデータそのまま
  | 'high'        // 高精度
  | 'medium'      // 中精度
  | 'low'         // 低精度
  | 'ultra-low';  // 超低精度
```

## スタイル関連の型

### ColorTheme

カラーテーマを定義する型です。

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

出典表示のオプションを定義する型です。

```typescript
interface AttributionOptions {
  showLink?: boolean;
  position?: AttributionPosition;
  style?: any; // React.CSSProperties | SvelteStyleObject
}

type AttributionPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right';
```

## 状態管理の型

### MapState

地図の内部状態を表す型です。

```typescript
interface MapState {
  selectedPrefecture: Prefecture | null;
  hoveredPrefecture: Prefecture | null;
  hoveredMunicipality: Municipality | null;
  viewBox: string;
  scale: number;
  translateX: number;
  translateY: number;
  showTokyoIslands?: boolean;
}
```

### DeformMode

ディフォルメモードを表す型です。

```typescript
type DeformMode = 'none' | 'grid' | 'hexagon';
```

## ユーティリティ型

### Bounds

境界ボックスを表す型です。

```typescript
type Bounds = [[number, number], [number, number]];
// [[西経, 南緯], [東経, 北緯]]
```

### Coordinate

座標を表す型です。

```typescript
type Coordinate = [number, number];
// [経度, 緯度]
```

### ProjectionConfig

投影設定を表す型です。

```typescript
interface ProjectionConfig {
  scale: number;
  translateX: number;
  translateY: number;
  center: [number, number];
}
```

## 型のインポート

TypeScriptプロジェクトで型定義を使用する方法：

```typescript
import type {
  Prefecture,
  Municipality,
  ColorTheme,
  JapanMapSelectorProps,
  MapState,
  SimplificationLevel,
  ThemePreset
} from 'japan-map-selector';
```

## 型ガード

型の判定に使用できるユーティリティ関数：

```typescript
// Polygonかどうかを判定
function isPolygon(geometry: any): geometry is { type: 'Polygon'; coordinates: number[][][] } {
  return geometry?.type === 'Polygon';
}

// MultiPolygonかどうかを判定
function isMultiPolygon(geometry: any): geometry is { type: 'MultiPolygon'; coordinates: number[][][][] } {
  return geometry?.type === 'MultiPolygon';
}

// 都道府県コードかどうかを判定
function isPrefectureCode(code: string): boolean {
  const num = parseInt(code, 10);
  return num >= 1 && num <= 47;
}
```

## カスタム型の拡張

プロジェクトで型を拡張する例：

```typescript
// 人口データを含む拡張Prefecture型
interface PrefectureWithPopulation extends Prefecture {
  population: {
    total: number;
    density: number;
    households: number;
  };
}

// カスタムイベントハンドラ
interface ExtendedMapProps extends JapanMapSelectorProps {
  onDataLoad?: (data: { prefectures: Prefecture[]; municipalities: Municipality[] }) => void;
  onError?: (error: Error) => void;
}
```