# デモの実装方法

このページでは、Japan Map Selectorのインタラクティブなデモを実装する方法を説明します。

## スタンドアロンHTML

最も簡単な方法は、スタンドアロンのHTMLファイルを作成することです。

### 1. HTMLファイルの作成

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Map Selector Demo</title>
  <style>
    #map-container {
      width: 800px;
      height: 600px;
      margin: 20px auto;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
  
  <!-- ビルド済みのJavaScriptファイルを読み込み -->
  <script src="./japan-map-selector.js"></script>
  <script>
    // デモの実装
    const { JapanMapSelector } = window.JapanMapSelector;
    
    const map = new JapanMapSelector({
      width: 800,
      height: 600,
      theme: 'colorful',
      onPrefectureSelect: (prefecture) => {
        console.log('選択された都道府県:', prefecture.name);
      },
      onMunicipalitySelect: (municipality) => {
        console.log('選択された市区町村:', municipality.name);
      }
    });
    
    // 初期化
    map.initialize(
      './data/prefectures.json',
      './data/municipalities.json'
    ).then(() => {
      // レンダリング処理
      renderMap();
    });
  </script>
</body>
</html>
```

### 2. 必要なファイルの配置

```
demo/
├── index.html
├── japan-map-selector.js  # ビルド済みライブラリ
└── data/
    ├── prefectures.json
    └── municipalities.json
```

## Viteを使用したデモ

より高度なデモを作成する場合は、Viteを使用します。

### 1. プロジェクトのセットアップ

```bash
npm create vite@latest japan-map-demo -- --template vanilla
cd japan-map-demo
npm install
npm install japan-map-selector
```

### 2. main.jsの実装

```javascript
import { JapanMapSelector } from 'japan-map-selector';
import './style.css';

// アプリケーションの初期化
document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>Japan Map Selector Demo</h1>
    
    <div class="controls">
      <select id="theme-select">
        <option value="default">Default</option>
        <option value="dark">Dark</option>
        <option value="colorful">Colorful</option>
      </select>
      
      <button id="reset-btn">リセット</button>
    </div>
    
    <div id="map-container"></div>
    
    <div id="info-panel">
      <p>都道府県をクリックしてください</p>
    </div>
  </div>
`;

// 地図の初期化
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'colorful'
});

async function init() {
  await map.initialize(
    '/data/prefectures.json',
    '/data/municipalities.json'
  );
  
  setupEventHandlers();
  render();
}

function setupEventHandlers() {
  // テーマ変更
  document.getElementById('theme-select').addEventListener('change', (e) => {
    map.setTheme(e.target.value);
  });
  
  // リセットボタン
  document.getElementById('reset-btn').addEventListener('click', () => {
    map.resetView();
  });
  
  // 地図のイベント
  map.on('prefectureSelected', (prefecture) => {
    updateInfoPanel(`${prefecture.name}が選択されました`);
  });
  
  map.on('municipalitySelected', (municipality) => {
    updateInfoPanel(`${municipality.name}が選択されました`);
  });
}

function updateInfoPanel(message) {
  document.querySelector('#info-panel p').textContent = message;
}

function render() {
  // React/Svelteコンポーネントを使用するか、
  // 独自のレンダリングロジックを実装
}

init();
```

## CDN版の使用

CDNから直接ライブラリを読み込む場合：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Japan Map Selector CDN Demo</title>
</head>
<body>
  <div id="map"></div>
  
  <!-- CDNからライブラリを読み込み（実際のCDN URLに置き換え） -->
  <script src="https://unpkg.com/japan-map-selector@latest/dist/japan-map-selector.umd.js"></script>
  <script>
    const { JapanMapSelector } = window.JapanMapSelector;
    
    // 使用例
    const map = new JapanMapSelector({
      width: 800,
      height: 600
    });
  </script>
</body>
</html>
```

## CodePen/CodeSandboxでのデモ

オンラインエディタでデモを作成する場合：

### CodePen

```javascript
// Pen SettingsのJSセクションで外部スクリプトを追加
// https://unpkg.com/japan-map-selector@latest/dist/japan-map-selector.umd.js

const map = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'colorful'
});

// データはCDNまたはGitHub Rawから読み込み
map.initialize(
  'https://raw.githubusercontent.com/user/repo/main/data/prefectures.json',
  'https://raw.githubusercontent.com/user/repo/main/data/municipalities.json'
);
```

### CodeSandbox

1. 新しいVanilla JavaScriptプロジェクトを作成
2. package.jsonに依存関係を追加
3. index.jsでライブラリをインポート

## データの準備

デモ用のデータは以下の方法で準備できます：

### 1. 簡略化されたデータを使用

```javascript
// 簡略化レベルごとのデータ
const dataUrls = {
  'ultra-low': {
    prefectures: '/data/prefectures-ultra-low.json',
    municipalities: '/data/municipalities-ultra-low.json'
  },
  'low': {
    prefectures: '/data/prefectures-low.json',
    municipalities: '/data/municipalities-low.json'
  },
  'medium': {
    prefectures: '/data/prefectures-medium.json',
    municipalities: '/data/municipalities-medium.json'
  }
};
```

### 2. プログレッシブローディング

```javascript
// 初回は軽量データで表示
await map.initialize(
  dataUrls['ultra-low'].prefectures,
  dataUrls['ultra-low'].municipalities
);

// バックグラウンドで高品質データを読み込み
setTimeout(async () => {
  await map.initialize(
    dataUrls['medium'].prefectures,
    dataUrls['medium'].municipalities
  );
}, 1000);
```

## トラブルシューティング

### CORS エラー

ローカルファイルを読み込む際にCORSエラーが発生する場合：

```bash
# ローカルサーバーを起動
npx serve .
# または
python -m http.server 8000
```

### データが大きすぎる

デモ用には簡略化されたデータを使用：

```bash
# mapshaper を使用してデータを簡略化
npx mapshaper input.json -simplify 10% -o output.json
```

### パフォーマンスの問題

- 初期表示は低解像度データを使用
- 必要に応じて高解像度データに切り替え
- Web Workerを使用して処理を分離

## 完全なデモの例

完全に動作するデモの実装例は、以下のリポジトリで確認できます：

- [GitHub - japan-map-selector-demo](https://github.com/example/japan-map-selector-demo)
- [CodePen - Interactive Demo](https://codepen.io/example/pen/japan-map-selector)
- [CodeSandbox - Full Example](https://codesandbox.io/s/japan-map-selector-demo)