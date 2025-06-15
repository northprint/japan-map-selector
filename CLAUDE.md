# 日本地図セレクタープロジェクト

## プロジェクト概要
日本の都道府県・市区町村を選択できるインタラクティブな地図コンポーネント。TypeScriptで実装され、React、Svelte、バニラJavaScriptで使用可能。

## 主要ファイル構成
```
japan-map-selector/
├── src/
│   ├── core/
│   │   ├── japan-map-selector.ts  # メインクラス
│   │   ├── data-loader.ts         # GeoJSONデータ読み込み
│   │   ├── map-renderer.ts        # SVGレンダリング
│   │   └── tokyo-islands.ts       # 東京都離島リスト
│   ├── react/                     # Reactラッパー
│   ├── svelte/                    # Svelteラッパー
│   └── types/                     # TypeScript型定義
├── demo.html                      # メインデモページ
└── package.json                   # プロジェクト設定
```

## 技術的な特徴

### 1. 座標系とレンダリング
- メルカトル投影（簡易版）を使用
- SVGのviewBoxで表示領域を制御
- GeoJSONからSVGパスへの変換

### 2. 特殊な処理
- **沖縄県**: 左上に2倍サイズで別枠表示
- **離島フィルタリング**: 全国表示時は主要な陸地のみ表示
- **東京都**: 本土/離島の切り替えボタン

### 3. インタラクション
- マウスホバーでハイライト
- クリックで都道府県→市区町村へドリルダウン
- WebGIS風の操作（ズーム、パン）

## よくある問題と解決方法

### Q: 都道府県が表示されない
A: データのパスを確認。正しいパス:
- 都道府県: `data/municipality/geojson/s0010/prefectures.json`
- 市区町村: `data/municipality/geojson/s0010/N03-21_210101.json`

### Q: クリックが効かない
A: 都道府県コードが正しく設定されているか確認。`PREFECTURE_CODES`マッピングを使用。

### Q: 地図が切れる
A: `calculateOptimalProjection()`でスケールと中心を調整。特に:
```typescript
const centerLat = (minLat + maxLat) / 2 + 2.0; // 北に移動して全体を下に
```

## 開発時の注意点

1. **ホバー状態の管理**
   - 無限ループを防ぐため、状態が実際に変更された場合のみイベントを発火
   
2. **ビューボックスの更新**
   - ユーザーがズーム/パンした状態を保持するため、必要な時のみ更新

3. **ドラッグ操作**
   - ドラッグ中はクリックイベントを無視（`isDragging`フラグ）

## 拡張のヒント

### データの可視化を追加する場合
```typescript
// 都道府県に色を付ける例
getPrefecturePath(prefecture: Prefecture): string {
  // パスを生成
  const path = geometryToPath(geometry, this.currentProjection);
  
  // データに基づいて色を決定
  const color = this.getColorByData(prefecture.code);
  
  return path;
}
```

### 検索機能を追加する場合
```typescript
searchPrefecture(keyword: string): Prefecture | null {
  return this.prefectures.find(p => 
    p.name.includes(keyword)
  );
}
```

## デバッグ方法

1. **console.log追加位置**
   - `selectPrefecture()`: 選択処理の確認
   - `geometryToPath()`: 座標変換の確認
   - イベントハンドラー: クリック/ホバーの確認

2. **デバッグ情報表示**
   - demo.htmlの`debug-info`要素に情報を出力

3. **座標確認**
   - ブラウザの開発者ツールでSVGパスを確認
   - getBBox()で実際の描画領域を取得

## パフォーマンス最適化

1. **大量の市区町村データ**
   - 表示中の都道府県のみレンダリング
   - 必要に応じて遅延読み込み

2. **アニメーション**
   - requestAnimationFrameを使用
   - 進行中のアニメーションはキャンセル

## 今後の課題

- [ ] モバイル対応（タッチ操作）
- [ ] アクセシビリティ向上
- [ ] データの動的更新
- [ ] 選択状態の永続化