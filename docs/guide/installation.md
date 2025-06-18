# インストール

Japan Map Selectorは、npm、yarn、pnpm、またはCDN経由でインストールできます。

## パッケージマネージャーを使用

### npm

```bash
npm install japan-map-selector
```

### yarn

```bash
yarn add japan-map-selector
```

### pnpm

```bash
pnpm add japan-map-selector
```

## CDN を使用

### unpkg

```html
<!-- 最新版 -->
<script src="https://unpkg.com/japan-map-selector@latest/dist/index.js"></script>

<!-- 特定のバージョン -->
<script src="https://unpkg.com/japan-map-selector@1.0.0/dist/index.js"></script>
```

### jsDelivr

```html
<!-- 最新版 -->
<script src="https://cdn.jsdelivr.net/npm/japan-map-selector@latest/dist/index.js"></script>

<!-- 特定のバージョン -->
<script src="https://cdn.jsdelivr.net/npm/japan-map-selector@1.0.0/dist/index.js"></script>
```

## 地理データの取得

地図を表示するには、GeoJSONフォーマットの地理データが必要です。

### オプション1: GitHubから直接ダウンロード

[smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography) から必要なファイルをダウンロードします：

```bash
# 都道府県データ
curl -O https://raw.githubusercontent.com/smartnews-smri/japan-topography/master/data/municipality/geojson/s0010/prefectures.json

# 市区町村データ
curl -O https://raw.githubusercontent.com/smartnews-smri/japan-topography/master/data/municipality/geojson/s0010/N03-21_210101.json
```

### オプション2: 簡略化されたデータを使用

パフォーマンスを向上させるため、簡略化されたデータを使用することを推奨します：

```bash
# 中精度の都道府県データ（推奨）
curl -O https://example.com/prefectures-medium.json

# 中精度の市区町村データ（推奨）
curl -O https://example.com/municipalities-medium.json
```

## プロジェクトの構成

インストール後、以下のような構成でプロジェクトを設定します：

```
your-project/
├── node_modules/
├── public/
│   └── data/
│       ├── prefectures.json      # 都道府県データ
│       └── municipalities.json   # 市区町村データ
├── src/
│   └── App.js                    # あなたのアプリケーション
└── package.json
```

## TypeScript の設定

TypeScriptを使用する場合、型定義は自動的に含まれます。`tsconfig.json`で以下の設定を確認してください：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## ビルドツールの設定

### Vite

```javascript
// vite.config.js
export default {
  // 特別な設定は不要
}
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

## 次のステップ

インストールが完了したら、[基本的な使い方](/guide/basic-usage)に進んでください。