# パフォーマンス最適化

Japan Map Selectorのパフォーマンスを最適化する方法について説明します。

## 初回ロード時間の短縮

### 問題

デフォルトでは、初回ロード時に以下のデータを読み込みます：
- 都道府県データ（中精度）: 272KB
- 市区町村データ（中精度）: 2.0MB

特に市区町村データが大きいため、初回表示に時間がかかることがあります。

### 解決策1: より軽量なデータを使用（推奨）

低精度データを使用することで、初回ロード時間を約60%短縮できます：

```javascript
// 低精度データを使用（1.3MB = 都道府県84KB + 市区町村1.2MB）
await map.initialize(
  './node_modules/japan-map-selector/src/data/simplified/prefectures-low.geojson',
  './node_modules/japan-map-selector/src/data/simplified/municipalities-low.geojson'
);

// CDNから低精度データを読み込む場合
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-low.geojson'
);
```

**パフォーマンス比較：**
- 中精度（デフォルト）: 約2.3MB → 初回ロード 3-5秒
- 低精度: 約1.3MB → 初回ロード 1-2秒
- 超低精度: 約700KB → 初回ロード 0.5-1秒

### 解決策2: CDNとキャッシュの活用（推奨）

CDNを使用することで、以下のメリットがあります：
- グローバルなエッジサーバーからの高速配信
- ブラウザキャッシュの自動活用（2回目以降は瞬時に読み込み）
- gzip圧縮による転送サイズの削減（約70%削減）

```javascript
// CDNから読み込む（unpkgを使用）
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-low.geojson'
);

// バージョンを固定してより確実なキャッシュを実現
await map.initialize(
  'https://unpkg.com/japan-map-selector@0.1.2/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@0.1.2/src/data/simplified/municipalities-low.geojson'
);
```

**キャッシュ効果：**
- 初回アクセス: 1-2秒（低精度データ使用時）
- 2回目以降: 0.1-0.3秒（キャッシュから読み込み）

### 解決策3: 実装例 - 最適化されたコード

以下は、低精度データとCDNを組み合わせた最適な実装例です：

```javascript
// 高速な初期化設定
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'default'
});

// CDNから低精度データを読み込む
const startTime = performance.now();

await map.initialize(
  'https://unpkg.com/japan-map-selector@0.1.2/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@0.1.2/src/data/simplified/municipalities-low.geojson'
);

const loadTime = performance.now() - startTime;
console.log(`地図の読み込み時間: ${loadTime}ms`);

// 結果:
// 初回: 1000-2000ms
// 2回目以降: 100-300ms（キャッシュ利用）
```

### 解決策4: 都道府県別動的ローディング（v0.2.0で実装）

都道府県を選択した時に、その都道府県の市区町村データのみを動的に読み込む機能：

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  enableDynamicLoading: true, // 動的ローディングを有効化
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data',
  onMunicipalityLoadStart: (prefecture) => {
    console.log(`${prefecture.name}の市区町村データを読み込んでいます...`);
  },
  onMunicipalityLoadEnd: (prefecture) => {
    console.log(`${prefecture.name}の市区町村データの読み込み完了`);
  }
});

// 都道府県データのみ読み込む（超高速: ~100KB）
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  '' // 市区町村データURLは空でOK
);
```

**効果：**
- 初回ロード: ~100KB（都道府県のみ）
- 都道府県選択時: 10～200KB（必要な分のみ）
- メモリ使用量: 必要なデータのみ保持

**使用例：**
```javascript
// 都道府県選択時に非同期でデータを読み込む
await selector.selectPrefecture('13'); // 東京都を選択
// → この時点で東京都の市区町村データが読み込まれる
```

## レンダリングパフォーマンス

### SVGの最適化

大量のパスを描画する際のパフォーマンス向上：

```javascript
// ディフォルメ機能を使用して描画要素を削減
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  // グリッドベースのディフォルメで要素数を削減
  deformMode: 'grid',
  gridSize: 0.2
});
```

### ビューポート外の要素を非表示

ズーム時にビューポート外の要素を非表示にする（将来実装予定）：

```javascript
const map = new JapanMapSelector({
  enableViewportCulling: true, // ビューポート外の要素を非表示
  cullingMargin: 50 // ビューポート外マージン（ピクセル）
});
```

## メモリ使用量の削減

### 不要なデータの削除

使用しない精度レベルのデータは削除：

```bash
# プロダクションビルドで不要なデータを除外
npm run build -- --exclude-data=original,high,low,ultra-low
```

### データの動的アンロード

メモリ使用量を削減するため、不要になったデータをアンロード（将来実装予定）：

```javascript
// 都道府県表示に戻った時に市区町村データをアンロード
map.on('prefectureSelected', (prefecture) => {
  if (!prefecture) {
    map.unloadMunicipalityData();
  }
});
```

## プログレッシブエンハンスメント

### 段階的な機能追加

基本機能から順に追加することで、初回表示を高速化：

```javascript
// ステップ1: 基本的な地図を表示
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  enableAnimations: false, // アニメーションを無効化
  enableHover: false // ホバー効果を無効化
});

await map.initialize(prefectureUrl, municipalityUrl);

// ステップ2: インタラクティブ機能を追加
setTimeout(() => {
  map.enableAnimations();
  map.enableHover();
}, 1000);
```

## 測定とモニタリング

### パフォーマンスの測定

```javascript
// 読み込み時間の測定
const startTime = performance.now();

await map.initialize(prefectureUrl, municipalityUrl);

const loadTime = performance.now() - startTime;
console.log(`地図の読み込み時間: ${loadTime}ms`);

// レンダリング時間の測定
map.on('renderComplete', (renderTime) => {
  console.log(`レンダリング時間: ${renderTime}ms`);
});
```

## ベストプラクティス

1. **適切な精度レベルの選択**
   - モバイル: 低精度または超低精度
   - デスクトップ: 中精度または高精度
   - 詳細表示が必要: オリジナル

2. **遅延ローディングの活用**
   - 初回は都道府県のみ表示
   - 市区町村は選択時に読み込み

3. **キャッシュの活用**
   - CDNを使用
   - 適切なCache-Controlヘッダー設定
   - Service Workerでのキャッシュ

4. **プログレッシブエンハンスメント**
   - 基本機能から段階的に追加
   - 重要でない機能は遅延実行