# Japan Map Selector Examples

このディレクトリには、japan-map-selectorパッケージの使用例が含まれています。

## 利用可能な例

### 1. Vanilla JavaScript
`vanilla-js/index.html` - 純粋なJavaScriptでの実装例

### 2. React (予定)
`react/` - Reactコンポーネントとしての使用例

### 3. Svelte (予定)
`svelte/` - Svelteコンポーネントとしての使用例

## セットアップ方法

### NPMパッケージを使用する場合

1. パッケージをインストール:
```bash
npm install japan-map-selector
```

2. インポートして使用:
```javascript
import { JapanMapSelector } from 'japan-map-selector';
```

### CDNを使用する場合

```html
<script type="module">
  import { JapanMapSelector } from 'https://unpkg.com/japan-map-selector@latest/dist/index.es.js';
</script>
```

## データファイルについて

地図データ（GeoJSON）は以下の方法で読み込めます：

### 1. CDN経由（推奨）
```javascript
const baseUrl = 'https://unpkg.com/japan-map-selector@latest/src/data/simplified';
const prefectureFile = `${baseUrl}/prefectures-medium.geojson`;
const municipalityFile = `${baseUrl}/municipalities-medium.geojson`;
```

### 2. 自前でホスティング
パッケージ内の `src/data/simplified/` ディレクトリからファイルをコピーして、
自分のサーバーでホスティングすることも可能です。

### 3. 動的データローディング
パフォーマンスを重視する場合は、都道府県ごとに分割されたデータを使用できます：

```javascript
selector = new JapanMapSelector({
  enableDynamicLoading: true,
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data'
});
```

## 注意事項

- データファイルのパスは環境に応じて適切に設定してください
- CORSの制限により、ローカルファイルから直接開く場合は動作しない可能性があります
- 開発時はローカルサーバーを使用することを推奨します

## 開発者向け

ローカルで開発する場合：

```bash
# リポジトリをクローン
git clone https://github.com/northprint/japan-map-selector.git
cd japan-map-selector

# 依存関係をインストール
npm install

# ビルド
npm run build

# ローカルサーバーを起動
npx http-server -p 8000

# ブラウザで開く
# http://localhost:8000/examples/vanilla-js/
```