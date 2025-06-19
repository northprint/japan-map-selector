# インストール

Japan Map Selectorは、npm、yarn、pnpm、またはCDN経由でインストールできます。パッケージサイズを最適化するため、デフォルトでは中精度のデータのみが含まれています。

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
<script src="https://unpkg.com/japan-map-selector@0.1.0/dist/index.js"></script>
```

### jsDelivr

```html
<!-- 最新版 -->
<script src="https://cdn.jsdelivr.net/npm/japan-map-selector@latest/dist/index.js"></script>

<!-- 特定のバージョン -->
<script src="https://cdn.jsdelivr.net/npm/japan-map-selector@0.1.0/dist/index.js"></script>
```

### CDNを使用する場合の注意点

CDNから読み込む場合も、地図データは別途読み込む必要があります：

```html
<script>
  const map = new JapanMapSelector.JapanMapSelector({
    width: 800,
    height: 600
  });
  
  // CDNから地図データも読み込む
  await map.initialize(
    'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-medium.geojson',
    'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-medium.geojson'
  );
</script>
```

## パッケージ内容

インストールされるパッケージには以下が含まれます：

### 含まれるもの

- **ライブラリ本体** (~150KB minified)
- **中精度の地図データ** (~2.3MB)
  - 都道府県データ: `src/data/simplified/prefectures-medium.geojson` (272KB)
  - 市区町村データ: `src/data/simplified/municipalities-medium.geojson` (2.0MB)
- **TypeScript型定義**

### 地図データの使用方法

パッケージに含まれる地図データは、以下の方法で読み込めます：

```javascript
// オプション1: ファイルパスを直接指定
await map.initialize(
  './node_modules/japan-map-selector/src/data/simplified/prefectures-medium.geojson',
  './node_modules/japan-map-selector/src/data/simplified/municipalities-medium.geojson'
);

// オプション2: バンドラー（Webpack、Vite等）でインポート
import prefectureData from 'japan-map-selector/src/data/simplified/prefectures-medium.geojson';
import municipalityData from 'japan-map-selector/src/data/simplified/municipalities-medium.geojson';

await map.initialize(prefectureData, municipalityData);
```

### その他の精度レベル

より高精度または低精度のデータが必要な場合は、将来リリース予定のオプショナルパッケージを利用できます。詳細は[データパッケージ](/guide/data-packages)のガイドを参照してください。

## プロジェクトの構成

インストール後、以下のような構成でプロジェクトを設定します：

```
your-project/
├── node_modules/
│   └── japan-map-selector/
│       ├── dist/                 # ライブラリ本体
│       └── src/data/simplified/  # 地図データ
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