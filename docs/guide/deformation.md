# ディフォルメ機能

地図を格子状に変形して、より抽象的でモダンな表現を可能にする機能です。

## 概要

ディフォルメ機能を使用すると、地理的に正確な地図を格子ベースの表現に変換できます。これにより、データ可視化やインフォグラフィックスに適した、視覚的にインパクトのある地図を作成できます。

## ディフォルメモード

### none（通常）
- 地理的に正確な表示
- デフォルト設定

### grid（グリッド）
- 正方形グリッドベースの変形
- カクカクとした幾何学的な表現
- データの可視化に最適

### hexagon（六角形）
- 六角形グリッドベースの変形
- より有機的な表現
- ゲームやインフォグラフィックスに適用

## 基本的な使い方

### プログラムによる設定

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600
});

// グリッドディフォルメを適用
map.setDeformMode('grid', 0.1); // gridSize: 0.1

// 六角形ディフォルメを適用
map.setDeformMode('hexagon', 0.15); // gridSize: 0.15

// ディフォルメを解除
map.setDeformMode('none');
```

### グリッドサイズの調整

グリッドサイズは変形の粒度を制御します：

```javascript
// 細かいグリッド（より正確）
map.setDeformMode('grid', 0.05);

// 標準的なグリッド
map.setDeformMode('grid', 0.1);

// 粗いグリッド（より抽象的）
map.setDeformMode('grid', 0.2);
```

## 実装例

### インタラクティブな切り替え

```javascript
// HTML
// <select id="deform-mode">
//   <option value="none">通常</option>
//   <option value="grid">グリッド</option>
//   <option value="hexagon">六角形</option>
// </select>

const deformSelect = document.getElementById('deform-mode');
deformSelect.addEventListener('change', (e) => {
  const mode = e.target.value;
  
  if (mode === 'none') {
    map.setDeformMode('none');
  } else {
    const gridSize = mode === 'grid' ? 0.1 : 0.15;
    map.setDeformMode(mode, gridSize);
  }
});
```

### アニメーション付き切り替え

```css
/* CSSトランジションを追加 */
.japan-map-selector svg path {
  transition: d 0.5s ease-in-out;
}
```

```javascript
// スムーズな切り替え
async function animateDeformation(targetMode, gridSize) {
  // フェードアウト
  const svg = document.querySelector('.japan-map-selector svg');
  svg.style.opacity = '0.5';
  
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // モード変更
  map.setDeformMode(targetMode, gridSize);
  
  // フェードイン
  svg.style.opacity = '1';
}
```

## 視覚効果の比較

### グリッドモード

```javascript
map.setDeformMode('grid', 0.1);
```

特徴：
- 正方形のセルに変形
- エッジが直線的
- データの均等な表現に適している
- ピクセルアート風の表現

### 六角形モード

```javascript
map.setDeformMode('hexagon', 0.15);
```

特徴：
- 六角形のセルに変形
- より自然な隣接関係
- ボードゲーム風の表現
- 有機的な印象

## 高度な使用例

### データ可視化との組み合わせ

```javascript
// 人口密度でセルの色を変更
const map = new JapanMapSelector({
  theme: 'monochrome',
  onPrefectureSelect: (prefecture) => {
    updateDataVisualization(prefecture);
  }
});

// グリッドディフォルメを適用
map.setDeformMode('grid', 0.1);

// カスタム色付け
function getColorByDensity(prefectureCode) {
  const density = populationDensity[prefectureCode];
  if (density > 1000) return '#ff0000';
  if (density > 500) return '#ff8800';
  if (density > 200) return '#ffff00';
  return '#00ff00';
}
```

### レスポンシブなグリッドサイズ

```javascript
function getOptimalGridSize() {
  const mapWidth = map.getProps().width;
  
  if (mapWidth < 400) {
    return 0.2; // モバイル：粗いグリッド
  } else if (mapWidth < 800) {
    return 0.15; // タブレット：中間
  } else {
    return 0.1; // デスクトップ：細かいグリッド
  }
}

// 画面サイズに応じて調整
window.addEventListener('resize', () => {
  const currentMode = getCurrentDeformMode();
  if (currentMode !== 'none') {
    map.setDeformMode(currentMode, getOptimalGridSize());
  }
});
```

### プリセット設定

```javascript
// ディフォルメプリセット
const deformPresets = {
  detailed: { mode: 'grid', size: 0.05 },
  standard: { mode: 'grid', size: 0.1 },
  abstract: { mode: 'grid', size: 0.2 },
  hexDetailed: { mode: 'hexagon', size: 0.1 },
  hexStandard: { mode: 'hexagon', size: 0.15 },
  hexAbstract: { mode: 'hexagon', size: 0.25 }
};

// プリセットを適用
function applyDeformPreset(presetName) {
  const preset = deformPresets[presetName];
  map.setDeformMode(preset.mode, preset.size);
}
```

## パフォーマンスの考慮事項

### 計算負荷

ディフォルメ処理は初回実行時に計算負荷がかかります：

```javascript
// 非同期でディフォルメを適用
async function applyDeformationAsync(mode, gridSize) {
  // ローディング表示
  showLoading();
  
  // 次のフレームで実行
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // ディフォルメ適用
  map.setDeformMode(mode, gridSize);
  
  // ローディング非表示
  hideLoading();
}
```

### メモリ使用量

グリッドサイズが小さいほどメモリ使用量が増加します：

| グリッドサイズ | セル数（概算） | メモリ使用量 |
|---------------|---------------|--------------|
| 0.05 | 20,000 | 高 |
| 0.1 | 5,000 | 中 |
| 0.2 | 1,250 | 低 |

## スタイリング

### カスタムスタイル

```css
/* グリッドモード用のスタイル */
.deform-grid path {
  stroke-width: 2;
  stroke-linejoin: miter;
  stroke-linecap: square;
}

/* 六角形モード用のスタイル */
.deform-hexagon path {
  stroke-width: 1.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* ホバーエフェクト */
.deform-grid path:hover,
.deform-hexagon path:hover {
  transform: scale(1.1);
  transform-origin: center;
  filter: brightness(1.2);
}
```

## トラブルシューティング

### ディフォルメが適用されない
- グリッドサイズが適切か確認
- データが正しく読み込まれているか確認

### パフォーマンスが悪い
- より大きなグリッドサイズを使用
- 簡略化レベルを下げる

### 境界が不自然
- `preserveTopology: true`オプションが有効になっているか確認
- グリッドサイズを調整