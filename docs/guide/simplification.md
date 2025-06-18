# 簡略化レベル

地図データの簡略化レベルを調整することで、ファイルサイズとパフォーマンスを最適化できます。

## 概要

Japan Map Selectorは5段階の簡略化レベルを提供しています。レベルが低いほどファイルサイズは小さくなりますが、地図の詳細度も低下します。

## 簡略化レベル

### original（元データ）
- **ファイルサイズ**: 最大（約50MB）
- **詳細度**: 最高
- **用途**: 印刷物、詳細な分析
- **パフォーマンス**: 低速

### high（高精度）
- **ファイルサイズ**: 大（約20MB）
- **詳細度**: 高
- **用途**: デスクトップアプリケーション
- **パフォーマンス**: 中速

### medium（中精度）
- **ファイルサイズ**: 中（約8MB）
- **詳細度**: 中
- **用途**: 一般的なWebアプリケーション
- **パフォーマンス**: 高速
- **推奨設定**

### low（低精度）
- **ファイルサイズ**: 小（約3MB）
- **詳細度**: 低
- **用途**: モバイルアプリケーション
- **パフォーマンス**: 非常に高速

### ultra-low（超低精度）
- **ファイルサイズ**: 最小（約1MB）
- **詳細度**: 最低
- **用途**: プレビュー、サムネイル
- **パフォーマンス**: 超高速

## 実装方法

### 初期化時に設定

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  simplificationLevel: 'medium' // 推奨
});

// データURLも簡略化レベルに応じて変更
await map.initialize(
  '/data/prefectures-medium.json',
  '/data/municipalities-medium.json'
);
```

### 動的に変更

```javascript
// 簡略化レベルを変更して再初期化
async function changeSimplificationLevel(level) {
  await map.initialize(
    `/data/prefectures-${level}.json`,
    `/data/municipalities-${level}.json`
  );
}

// 使用例
changeSimplificationLevel('low'); // モバイル向け
changeSimplificationLevel('high'); // デスクトップ向け
```

## レスポンシブな実装

デバイスに応じて自動的に簡略化レベルを選択：

```javascript
function getOptimalSimplificationLevel() {
  const width = window.innerWidth;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile || width < 768) {
    return 'low';
  } else if (width < 1200) {
    return 'medium';
  } else {
    return 'high';
  }
}

const map = new JapanMapSelector({
  simplificationLevel: getOptimalSimplificationLevel()
});
```

## パフォーマンス比較

| レベル | 初期化時間 | レンダリング時間 | メモリ使用量 |
|--------|------------|------------------|--------------|
| original | 3-5秒 | 100-200ms | 200MB |
| high | 1-2秒 | 50-100ms | 100MB |
| medium | 0.5-1秒 | 20-50ms | 50MB |
| low | 0.2-0.5秒 | 10-20ms | 20MB |
| ultra-low | <0.2秒 | <10ms | 10MB |

## ビジュアル比較

### 都道府県レベル

簡略化レベルによる見た目の違いは、都道府県レベルではほとんど目立ちません：

- **original/high**: 海岸線が非常に詳細
- **medium**: 一般的な用途には十分な詳細度
- **low/ultra-low**: 基本的な形状は維持

### 市区町村レベル

市区町村レベルでは違いが顕著になります：

- **original/high**: 小さな島や入り組んだ境界も正確
- **medium**: 主要な形状は維持、細かい凹凸は簡略化
- **low/ultra-low**: 基本的な境界のみ、詳細は省略

## 使用ガイドライン

### Webアプリケーション
```javascript
// 推奨設定
const map = new JapanMapSelector({
  simplificationLevel: 'medium'
});
```

### モバイルアプリケーション
```javascript
// データ通信量とパフォーマンスを重視
const map = new JapanMapSelector({
  simplificationLevel: 'low'
});
```

### 分析・可視化ツール
```javascript
// 精度を重視
const map = new JapanMapSelector({
  simplificationLevel: 'high'
});
```

### プログレッシブローディング

初期表示を高速化し、後から詳細データを読み込む：

```javascript
class ProgressiveMap {
  constructor() {
    this.map = new JapanMapSelector({
      simplificationLevel: 'ultra-low'
    });
  }
  
  async initialize() {
    // まず超低精度で表示
    await this.map.initialize(
      '/data/prefectures-ultra-low.json',
      '/data/municipalities-ultra-low.json'
    );
    
    // バックグラウンドで高精度データを読み込み
    setTimeout(() => {
      this.upgradeToHighQuality();
    }, 1000);
  }
  
  async upgradeToHighQuality() {
    // ユーザーの操作を妨げないように高精度データに切り替え
    await this.map.initialize(
      '/data/prefectures-medium.json',
      '/data/municipalities-medium.json'
    );
  }
}
```

## データの準備

異なる簡略化レベルのデータを準備する方法：

```bash
# mapshaper などのツールを使用
mapshaper prefectures.json \
  -simplify 50% \
  -o prefectures-medium.json

mapshaper prefectures.json \
  -simplify 10% \
  -o prefectures-low.json
```

## トラブルシューティング

### 地図が粗すぎる
- より高い簡略化レベルを使用
- ズーム時のみ高精度データに切り替え

### パフォーマンスが悪い
- より低い簡略化レベルを使用
- デバイスに応じて動的に調整

### ファイルサイズが大きい
- 適切な簡略化レベルを選択
- gzip圧縮を有効化