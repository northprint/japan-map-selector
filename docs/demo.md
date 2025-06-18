# インタラクティブデモ

<style>
  .demo-container {
    margin: 20px 0;
    border: 1px solid #e2e2e3;
    border-radius: 8px;
    overflow: hidden;
    height: 700px;
  }
  .demo-container iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<div class="demo-container">
  <iframe src="./demo-interactive.html" title="Japan Map Selector Interactive Demo"></iframe>
</div>

## デモの機能

このデモでは以下の機能を試すことができます：

### 🎨 テーマの切り替え
7種類のプリセットテーマから選択できます。各テーマは異なる配色とスタイルを提供します。

### 📐 簡略化レベル
地図データの詳細度を5段階で調整できます。ファイルサイズとパフォーマンスのバランスを確認してください。

### 🔷 ディフォルメ機能
グリッドベースまたは六角形グリッドによるディフォルメを適用できます。地図を抽象的に表現したい場合に便利です。

### 🖱️ インタラクティブ操作
- **クリック**: 都道府県を選択し、市区町村表示に切り替え
- **ホバー**: マウスオーバーで地域をハイライト
- **ドラッグ**: 地図を移動（市区町村表示時）
- **ホイール**: ズームイン/アウト（市区町村表示時）

### 📍 特殊な表示
- 沖縄県は左上に別枠で表示
- 北方領土は除外
- 東京都の離島は選択可能（市区町村表示時）