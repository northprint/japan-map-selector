# 基本的な例

Japan Map Selectorの基本的な使い方を紹介します。

## 最小限の実装

### HTML

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Map Selector - 基本例</title>
  <style>
    #map-container {
      width: 800px;
      height: 600px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
  
  <script type="module">
    import { JapanMapSelector } from './dist/index.es.js';
    
    // 地図を初期化
    const map = new JapanMapSelector({
      width: 800,
      height: 600
    });
    
    // データを読み込んで表示
    async function init() {
      await map.initialize(
        '/data/prefectures.json',
        '/data/municipalities.json'
      );
      
      // コンテナに地図を描画
      renderMap();
    }
    
    function renderMap() {
      const container = document.getElementById('map-container');
      // ここで実際の描画処理を実装
      // （React/Svelteコンポーネントを使用することを推奨）
    }
    
    init();
  </script>
</body>
</html>
```

## イベントハンドリング

### 選択イベントの処理

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  // 都道府県選択時
  onPrefectureSelect: (prefecture) => {
    console.log(`${prefecture.name}が選択されました`);
    updateInfoPanel(prefecture);
  },
  // 市区町村選択時
  onMunicipalitySelect: (municipality) => {
    console.log(`${municipality.name}が選択されました`);
    showMunicipalityDetails(municipality);
  }
});

function updateInfoPanel(prefecture) {
  const panel = document.getElementById('info-panel');
  panel.innerHTML = `
    <h2>${prefecture.name}</h2>
    <p>都道府県コード: ${prefecture.code}</p>
    <p>市区町村を選択してください</p>
  `;
}

function showMunicipalityDetails(municipality) {
  const panel = document.getElementById('info-panel');
  panel.innerHTML = `
    <h2>${municipality.name}</h2>
    <p>市区町村コード: ${municipality.code}</p>
    <button onclick="selectMunicipality('${municipality.code}')">
      詳細を見る
    </button>
  `;
}
```

## テーマの適用

### プリセットテーマ

```javascript
// ダークテーマ
const darkMap = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'dark'
});

// カラフルテーマ（都道府県ごとに異なる色）
const colorfulMap = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'colorful'
});
```

### カスタムカラー

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  // 個別に色を指定
  prefectureColor: '#3498db',
  prefectureHoverColor: '#2980b9',
  municipalityColor: '#e74c3c',
  municipalityHoverColor: '#c0392b'
});
```

## レスポンシブ対応

### 画面サイズに合わせて調整

```javascript
function createResponsiveMap() {
  const container = document.getElementById('map-container');
  const width = container.offsetWidth;
  const height = Math.min(width * 0.75, window.innerHeight - 100);
  
  return new JapanMapSelector({
    width,
    height,
    theme: 'default'
  });
}

// ウィンドウリサイズ時に再描画
let map = createResponsiveMap();

window.addEventListener('resize', debounce(() => {
  map = createResponsiveMap();
  // 再描画処理
}, 300));

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

## 状態管理

### 選択状態の保持

```javascript
class MapWithState {
  constructor() {
    this.selectedPrefecture = null;
    this.selectedMunicipality = null;
    
    this.map = new JapanMapSelector({
      width: 800,
      height: 600,
      onPrefectureSelect: this.handlePrefectureSelect.bind(this),
      onMunicipalitySelect: this.handleMunicipalitySelect.bind(this)
    });
  }
  
  handlePrefectureSelect(prefecture) {
    this.selectedPrefecture = prefecture;
    this.selectedMunicipality = null;
    this.updateUI();
  }
  
  handleMunicipalitySelect(municipality) {
    this.selectedMunicipality = municipality;
    this.updateUI();
  }
  
  updateUI() {
    // UIを更新
    const breadcrumb = document.getElementById('breadcrumb');
    let path = '日本';
    
    if (this.selectedPrefecture) {
      path += ` > ${this.selectedPrefecture.name}`;
    }
    
    if (this.selectedMunicipality) {
      path += ` > ${this.selectedMunicipality.name}`;
    }
    
    breadcrumb.textContent = path;
  }
  
  // 状態をリセット
  reset() {
    this.selectedPrefecture = null;
    this.selectedMunicipality = null;
    this.map.resetView();
    this.updateUI();
  }
}
```

## 初期選択の設定

### 特定の都道府県を初期表示

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  selectedPrefectureCode: '13' // 東京都を初期選択
});

// 初期化後に選択
async function initWithSelection() {
  await map.initialize(
    '/data/prefectures.json',
    '/data/municipalities.json'
  );
  
  // 大阪府を選択
  map.selectPrefecture('27');
}
```

## エラーハンドリング

### データ読み込みエラー

```javascript
async function initializeMap() {
  const map = new JapanMapSelector({
    width: 800,
    height: 600
  });
  
  try {
    await map.initialize(
      '/data/prefectures.json',
      '/data/municipalities.json'
    );
    
    console.log('地図の初期化に成功しました');
    renderMap(map);
    
  } catch (error) {
    console.error('地図の初期化に失敗しました:', error);
    
    // エラーメッセージを表示
    const container = document.getElementById('map-container');
    container.innerHTML = `
      <div class="error-message">
        <p>地図データの読み込みに失敗しました。</p>
        <button onclick="location.reload()">再読み込み</button>
      </div>
    `;
  }
}
```

## アクセシビリティ

### キーボード操作の追加

```javascript
// キーボードナビゲーション
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'Escape':
      // 全体表示に戻る
      map.resetView();
      break;
      
    case 'ArrowUp':
    case 'ArrowDown':
      // 都道府県リストをナビゲート
      navigatePrefectures(e.key === 'ArrowUp' ? -1 : 1);
      break;
      
    case 'Enter':
      // 現在のフォーカスを選択
      selectFocused();
      break;
  }
});

function navigatePrefectures(direction) {
  const prefectures = map.getPrefectures();
  // ナビゲーションロジックを実装
}
```

## 完全な実装例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Map Selector - 完全な例</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    
    #map-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .info-panel {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>日本地図セレクター</h1>
    
    <div class="controls">
      <button id="reset-btn">リセット</button>
      <select id="theme-select">
        <option value="default">デフォルト</option>
        <option value="dark">ダーク</option>
        <option value="colorful">カラフル</option>
      </select>
    </div>
    
    <div id="map-container"></div>
    
    <div class="info-panel" id="info">
      <p>都道府県をクリックしてください</p>
    </div>
  </div>
  
  <script type="module">
    // 実装コードをここに記述
  </script>
</body>
</html>
```