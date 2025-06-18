# Japan Map Selector Examples

このディレクトリには、Japan Map Selectorの使用例が含まれています。

## サンプル一覧

### 1. [demo.html](../demo.html)
バニラJavaScriptを使用した包括的なデモページです。
- すべての機能を網羅
- ズーム、パン、ドラッグ操作
- テーマ切り替え
- 簡略化レベルの調整
- ディフォルメモード（グリッド、六角形）

### 2. [react-example.html](./react-example.html)
Reactを使用したサンプルアプリケーションです。
- CDN経由でReactを使用
- JSXをBabelでトランスパイル
- フック（useState、useEffect、useCallback）を活用
- コンポーネントベースの実装

### 3. [svelte-example.html](./svelte-example.html)
Svelteを使用したサンプルアプリケーションです。
- CDN経由でSvelteコンパイラを使用
- リアクティブな状態管理
- カスタム色分けモード（人口密度、地方別）の実装例
- イベントハンドリング

## 実行方法

### 1. HTTPサーバーを起動
プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
# Python 3を使用する場合
python3 -m http.server 8000

# Node.jsのhttp-serverを使用する場合
npx http-server -p 8000
```

### 2. ブラウザでアクセス
- デモページ: http://localhost:8000/demo.html
- Reactサンプル: http://localhost:8000/examples/react-example.html
- Svelteサンプル: http://localhost:8000/examples/svelte-example.html

## 主な機能

### 共通機能
- 都道府県の選択
- 市区町村の選択
- テーマの切り替え（デフォルト、ダーク、カラフル）
- 簡略化レベルの調整（詳細、標準、簡略）
- ディフォルメモード（通常、グリッド、六角形）
- 東京都の離島表示切り替え

### React固有の機能
- コンポーネントベースの実装
- React Hooksを使用した状態管理
- 動的インポートによるモジュール読み込み

### Svelte固有の機能
- リアクティブな変数管理
- カスタム色分けモード
  - 人口密度による色分け（デモ用の仮想データ）
  - 地方別の色分け
- Svelteのイベントシステム（$on）

## カスタマイズのヒント

### 色のカスタマイズ
```javascript
// 都道府県ごとに異なる色を設定
prefectureFill: (prefecture) => {
  const colorMap = {
    '13': '#ff0000', // 東京都
    '27': '#ff3300', // 大阪府
    // ...
  };
  return colorMap[prefecture.code] || '#90EE90';
}
```

### イベントハンドリング
```javascript
// 都道府県選択時
selector.on('prefectureSelected', (prefecture) => {
  console.log('選択された都道府県:', prefecture.name);
});

// 市区町村選択時
selector.on('municipalitySelected', (municipality) => {
  console.log('選択された市区町村:', municipality.name);
});
```

### データの可視化
各サンプルは、実際のデータ可視化アプリケーションのベースとして使用できます。
人口データ、統計情報、選挙結果などを地図上に表示する際の参考にしてください。

## トラブルシューティング

### 地図が表示されない場合
1. HTTPサーバーが起動しているか確認
2. ブラウザのコンソールでエラーを確認
3. データファイルのパスが正しいか確認

### モジュールの読み込みエラー
1. `npm run build`でビルドが完了しているか確認
2. `dist/index.es.js`ファイルが存在するか確認

### CORSエラー
ローカルファイルを直接開くのではなく、必ずHTTPサーバー経由でアクセスしてください。