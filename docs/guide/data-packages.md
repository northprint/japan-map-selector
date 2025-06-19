# データパッケージ

Japan Map Selectorは、パッケージサイズを最適化するため、デフォルトでは中精度のデータのみを含んでいます。より高精度または低精度のデータが必要な場合は、オプショナルパッケージを利用できます。

## パッケージ構成

### メインパッケージ

```bash
npm install japan-map-selector
```

**含まれるデータ（中精度）:**
- 都道府県データ: 272KB
- 市区町村データ: 2.0MB
- **合計サイズ: 約2.3MB**

### オプショナルパッケージ（将来リリース予定）

現在、オプショナルパッケージは準備中です。v0.1.0では中精度データのみが利用可能です。

#### 最高精度（オリジナル）- 準備中

```bash
# 将来のリリースで利用可能になります
npm install japan-map-selector-data-original
```

- 都道府県データ: 2.3MB
- 市区町村データ: 8.4MB
- **合計サイズ: 約10.7MB**

#### 高精度 - 準備中

```bash
# 将来のリリースで利用可能になります
npm install japan-map-selector-data-high
```

- 都道府県データ: 644KB
- 市区町村データ: 3.5MB
- **合計サイズ: 約4.1MB**

#### 低精度 - 準備中

```bash
# 将来のリリースで利用可能になります
npm install japan-map-selector-data-low
```

- 都道府県データ: 84KB
- 市区町村データ: 1.2MB
- **合計サイズ: 約1.3MB**

#### 超低精度 - 準備中

```bash
# 将来のリリースで利用可能になります
npm install japan-map-selector-data-ultra-low
```

- 都道府県データ: 28KB
- 市区町村データ: 668KB
- **合計サイズ: 約696KB**

## 使い分けの指針

### 中精度（デフォルト）
- **推奨用途**: 一般的なWebアプリケーション
- **特徴**: ファイルサイズと表示品質のバランスが良い

### 最高精度（オリジナル）
- **推奨用途**: 詳細な地理情報が必要なアプリケーション
- **特徴**: 最も正確な境界線、ファイルサイズが大きい

### 高精度
- **推奨用途**: より詳細な表示が必要だが、ファイルサイズも考慮したい場合
- **特徴**: オリジナルに近い品質、中程度のファイルサイズ

### 低精度
- **推奨用途**: モバイルアプリケーション、パフォーマンス重視
- **特徴**: 軽量、基本的な形状は維持

### 超低精度
- **推奨用途**: プレビュー、サムネイル、極めて軽量な実装が必要な場合
- **特徴**: 最小限のファイルサイズ、簡略化された形状

## 現在利用可能なデータ

v0.1.0では、中精度データのみがパッケージに含まれています：

```javascript
// パッケージに含まれる中精度データを使用
import prefectureData from 'japan-map-selector/src/data/simplified/prefectures-medium.geojson';
import municipalityData from 'japan-map-selector/src/data/simplified/municipalities-medium.geojson';

await map.initialize(prefectureData, municipalityData);
```

## 将来のバージョンでの動的な精度切り替え

将来のバージョンでは、以下のような動的な精度切り替えが可能になる予定です：

```javascript
// 将来実装される予定の機能
import { getDataUrls } from 'japan-map-selector/data-utils';

// ユーザーが選択した精度レベル
const level = 'high'; // 'original', 'high', 'medium', 'low', 'ultra-low'
const urls = getDataUrls(level);

await map.initialize(urls.prefectures, urls.municipalities);
```

## CDNからの読み込み

unpkgなどのCDNを使用する場合：

```javascript
// 現在利用可能：中精度データ
await map.initialize(
  'https://unpkg.com/japan-map-selector@0.1.0/src/data/simplified/prefectures-medium.geojson',
  'https://unpkg.com/japan-map-selector@0.1.0/src/data/simplified/municipalities-medium.geojson'
);

// 将来のバージョンで利用可能になる予定
// await map.initialize(
//   'https://unpkg.com/japan-map-selector-data-original/prefectures.geojson',
//   'https://unpkg.com/japan-map-selector-data-original/municipalities.geojson'
// );
```