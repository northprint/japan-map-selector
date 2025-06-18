# Core API リファレンス

## JapanMapSelector クラス

メインのクラスで、地図の状態管理と描画を担当します。

### コンストラクタ

```typescript
new JapanMapSelector(props?: JapanMapSelectorProps)
```

#### パラメータ

- `props` (optional): 設定オプション

### プロパティ

```typescript
interface JapanMapSelectorProps {
  // 表示設定
  width?: number;                    // 地図の幅（デフォルト: 800）
  height?: number;                   // 地図の高さ（デフォルト: 600）
  
  // テーマ設定
  theme?: ColorTheme | string;       // テーマ名またはカスタムテーマ
  prefectureColor?: string;          // 都道府県の色
  prefectureHoverColor?: string;     // 都道府県のホバー色
  municipalityColor?: string;        // 市区町村の色
  municipalityHoverColor?: string;   // 市区町村のホバー色
  
  // 選択設定
  selectedPrefectureCode?: string;   // 初期選択の都道府県コード
  selectedMunicipalityCode?: string; // 初期選択の市区町村コード
  selectablePrefectures?: string[];  // 選択可能な都道府県コード配列
  
  // 無効化スタイル
  disabledPrefectureFill?: string;   // 選択不可の都道府県の塗りつぶし色
  disabledPrefectureStroke?: string; // 選択不可の都道府県の枠線色
  
  // 簡略化レベル
  simplificationLevel?: 'original' | 'high' | 'medium' | 'low' | 'ultra-low';
  
  // コールバック
  onPrefectureSelect?: (prefecture: Prefecture) => void;
  onMunicipalitySelect?: (municipality: Municipality) => void;
}
```

### メソッド

#### initialize(prefectureDataUrl, municipalityDataUrl)

地理データを読み込み、地図を初期化します。

```typescript
async initialize(
  prefectureDataUrl: string,
  municipalityDataUrl: string
): Promise<void>
```

**パラメータ:**
- `prefectureDataUrl`: 都道府県データのURL
- `municipalityDataUrl`: 市区町村データのURL

**使用例:**
```javascript
await map.initialize(
  '/data/prefectures.json',
  '/data/municipalities.json'
);
```

#### selectPrefecture(prefectureCode)

指定した都道府県を選択し、その市区町村を表示します。

```typescript
selectPrefecture(prefectureCode: string): void
```

**パラメータ:**
- `prefectureCode`: 都道府県コード（"01"〜"47"）

#### selectMunicipality(municipalityCode)

指定した市区町村を選択します。

```typescript
selectMunicipality(municipalityCode: string): void
```

#### hoverPrefecture(prefectureCode)

都道府県にホバー状態を設定します。

```typescript
hoverPrefecture(prefectureCode: string | null): void
```

#### hoverMunicipality(municipalityCode)

市区町村にホバー状態を設定します。

```typescript
hoverMunicipality(municipalityCode: string | null): void
```

#### resetView()

日本全体の表示に戻します。

```typescript
resetView(): void
```

#### toggleTokyoIslands()

東京都選択時に、離島の表示を切り替えます。

```typescript
toggleTokyoIslands(): void
```

#### setTheme(themeNameOrObject)

テーマを変更します。

```typescript
setTheme(themeNameOrObject: ColorTheme | string): void
```

#### setDeformMode(mode, gridSize?)

ディフォルメモードを設定します。

```typescript
setDeformMode(
  mode: 'none' | 'grid' | 'hexagon',
  gridSize?: number
): void
```

**パラメータ:**
- `mode`: ディフォルメモード
- `gridSize`: グリッドサイズ（度単位、デフォルト: 0.1）

### イベント

#### on(event, listener)

イベントリスナーを登録します。

```typescript
on(event: string, listener: Function): void
```

**利用可能なイベント:**
- `initialized`: 初期化完了時
- `prefectureSelected`: 都道府県選択時
- `municipalitySelected`: 市区町村選択時
- `stateChanged`: 状態変更時
- `themeChanged`: テーマ変更時

**使用例:**
```javascript
map.on('prefectureSelected', (prefecture) => {
  console.log('選択:', prefecture.name);
});
```

#### off(event, listener)

イベントリスナーを削除します。

```typescript
off(event: string, listener: Function): void
```

### ゲッターメソッド

#### getState()

現在の地図の状態を取得します。

```typescript
getState(): MapState
```

**戻り値:**
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

#### getPrefectures()

全都道府県のリストを取得します。

```typescript
getPrefectures(): Prefecture[]
```

#### getSelectedMunicipalities()

現在選択されている都道府県の市区町村リストを取得します。

```typescript
getSelectedMunicipalities(): Municipality[]
```

#### getTheme()

現在のテーマを取得します。

```typescript
getTheme(): ColorTheme
```

### パスの生成

#### getPrefecturePath(prefecture)

都道府県のSVGパスを生成します。

```typescript
getPrefecturePath(prefecture: Prefecture): string
```

#### getMunicipalityPath(municipality)

市区町村のSVGパスを生成します。

```typescript
getMunicipalityPath(municipality: Municipality): string
```

### 色の取得

#### getPrefectureFillColor(prefecture)

都道府県の塗りつぶし色を取得します。

```typescript
getPrefectureFillColor(prefecture: Prefecture): string
```

#### getMunicipalityFillColor(municipality)

市区町村の塗りつぶし色を取得します。

```typescript
getMunicipalityFillColor(municipality: Municipality): string
```

## 型定義

### Prefecture

```typescript
interface Prefecture {
  code: string;      // 都道府県コード（"01"〜"47"）
  name: string;      // 都道府県名
  bounds: [[number, number], [number, number]]; // 境界ボックス
  feature: GeoJSONFeature; // GeoJSONフィーチャー
}
```

### Municipality

```typescript
interface Municipality {
  code: string;          // 市区町村コード
  name: string;          // 市区町村名
  prefectureCode: string; // 所属する都道府県コード
  feature: GeoJSONFeature; // GeoJSONフィーチャー
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