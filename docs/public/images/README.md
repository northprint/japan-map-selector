# ドキュメント用画像

このディレクトリにはドキュメントサイトで使用する画像を配置します。

## 必要な画像

### 1. map-preview.png（ヒーロー画像）
- **サイズ**: 1200x800px または 1600x1000px
- **内容**: 
  - Japan Map Selectorの動作画面
  - カラフルテーマで都道府県が色分けされた状態
  - 東京都など一部の都道府県が選択された状態
  - 情報パネルやコントロールも含む

### 2. screenshots/（スクリーンショット）
- **basic-usage.png**: 基本的な使用例
- **theme-variations.png**: 各テーマのプレビュー
- **municipality-view.png**: 市区町村表示の例
- **deformation-grid.png**: グリッドディフォルメの例
- **deformation-hexagon.png**: 六角形ディフォルメの例

### 3. diagrams/（図解）
- **architecture.png**: アーキテクチャ図
- **data-flow.png**: データフロー図
- **simplification-levels.png**: 簡略化レベルの比較

## 画像の作成方法

### 実際のスクリーンショット
1. demo.htmlを開く
2. 各機能を操作してスクリーンショットを撮る
3. 画像を最適化（TinyPNGなど）

### デザインツールで作成
1. Figma、Sketch、Adobe XDなどを使用
2. 実際のUIに近いモックアップを作成
3. エクスポート時に最適化

### 推奨される画像編集ツール
- **macOS**: CleanShot X、Skitch
- **Windows**: Snagit、ShareX
- **クロスプラットフォーム**: Figma、Canva

## 画像の最適化

```bash
# PNGの最適化
pngquant --quality=65-80 map-preview.png

# WebPへの変換（オプション）
cwebp -q 80 map-preview.png -o map-preview.webp
```

## 画像のネーミング規則
- 小文字とハイフンを使用: `map-preview.png`
- 説明的な名前: `tokyo-municipality-view.png`
- バージョン番号は含めない