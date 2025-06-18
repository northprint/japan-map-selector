# イベント処理

Japan Map Selectorは様々なイベントを提供し、インタラクティブな地図アプリケーションの構築を可能にします。

## コールバック関数

### 基本的な使い方

```javascript
const map = new JapanMapSelector({
  onPrefectureSelect: (prefecture) => {
    console.log('都道府県が選択されました:', prefecture.name);
  },
  onMunicipalitySelect: (municipality) => {
    console.log('市区町村が選択されました:', municipality.name);
  }
});
```

### Prefectureオブジェクト

`onPrefectureSelect`コールバックで受け取るオブジェクト：

```typescript
interface Prefecture {
  code: string;        // 都道府県コード（例: '13'）
  name: string;        // 都道府県名（例: '東京都'）
  bounds: [[number, number], [number, number]]; // 境界ボックス
  feature: GeoJSONFeature; // GeoJSONフィーチャー
}
```

### Municipalityオブジェクト

`onMunicipalitySelect`コールバックで受け取るオブジェクト：

```typescript
interface Municipality {
  code: string;         // 市区町村コード
  name: string;         // 市区町村名
  prefectureCode: string; // 都道府県コード
  feature: GeoJSONFeature; // GeoJSONフィーチャー
}
```

## イベントリスナー

### カスタムイベントの購読

```javascript
// イベントリスナーを追加
map.on('stateChanged', (state) => {
  console.log('地図の状態が変更されました:', state);
});

map.on('prefectureSelected', (prefecture) => {
  console.log('都道府県選択イベント:', prefecture.name);
});

map.on('municipalitySelected', (municipality) => {
  console.log('市区町村選択イベント:', municipality.name);
});

// イベントリスナーを削除
const handler = (state) => console.log(state);
map.on('stateChanged', handler);
map.off('stateChanged', handler);
```

### 利用可能なイベント

| イベント名 | 説明 | パラメータ |
|-----------|------|------------|
| `initialized` | 地図データの読み込み完了 | なし |
| `stateChanged` | 地図の状態変更 | `MapState` |
| `prefectureSelected` | 都道府県選択 | `Prefecture` |
| `municipalitySelected` | 市区町村選択 | `Municipality` |
| `themeChanged` | テーマ変更 | `ColorTheme` |

## ホバーイベント

### プログラムによるホバー制御

```javascript
// 都道府県をホバー
map.hoverPrefecture('13'); // 東京都をホバー
map.hoverPrefecture(null); // ホバー解除

// 市区町村をホバー
map.hoverMunicipality('13101'); // 千代田区をホバー
map.hoverMunicipality(null); // ホバー解除
```

### ホバー状態の監視

```javascript
map.on('stateChanged', (state) => {
  if (state.hoveredPrefecture) {
    console.log('ホバー中の都道府県:', state.hoveredPrefecture.name);
  }
  if (state.hoveredMunicipality) {
    console.log('ホバー中の市区町村:', state.hoveredMunicipality.name);
  }
});
```

## 実装例

### 選択情報の表示

```javascript
// 情報パネルを更新する例
map.on('prefectureSelected', (prefecture) => {
  const infoPanel = document.getElementById('info-panel');
  infoPanel.innerHTML = `
    <h3>${prefecture.name}</h3>
    <p>都道府県コード: ${prefecture.code}</p>
    <p>市区町村を選択してください</p>
  `;
});

map.on('municipalitySelected', (municipality) => {
  const infoPanel = document.getElementById('info-panel');
  infoPanel.innerHTML = `
    <h3>${municipality.name}</h3>
    <p>市区町村コード: ${municipality.code}</p>
    <button onclick="showDetails('${municipality.code}')">
      詳細を見る
    </button>
  `;
});
```

### 選択履歴の管理

```javascript
class SelectionHistory {
  constructor(map) {
    this.history = [];
    this.map = map;
    
    // イベントを監視
    map.on('prefectureSelected', (prefecture) => {
      this.addToHistory({
        type: 'prefecture',
        data: prefecture,
        timestamp: new Date()
      });
    });
    
    map.on('municipalitySelected', (municipality) => {
      this.addToHistory({
        type: 'municipality',
        data: municipality,
        timestamp: new Date()
      });
    });
  }
  
  addToHistory(entry) {
    this.history.push(entry);
    this.updateUI();
  }
  
  updateUI() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = this.history
      .slice(-10) // 最新10件
      .reverse()
      .map(entry => `
        <li>
          ${entry.data.name} - 
          ${entry.timestamp.toLocaleTimeString()}
        </li>
      `)
      .join('');
  }
}
```

### 複数の地図の連動

```javascript
// メイン地図
const mainMap = new JapanMapSelector({
  width: 800,
  height: 600
});

// サブ地図（詳細表示用）
const detailMap = new JapanMapSelector({
  width: 400,
  height: 300
});

// メイン地図の選択をサブ地図に反映
mainMap.on('prefectureSelected', (prefecture) => {
  detailMap.selectPrefecture(prefecture.code);
});

// 両方の地図でホバーを同期
mainMap.on('stateChanged', (state) => {
  if (state.hoveredPrefecture) {
    detailMap.hoverPrefecture(state.hoveredPrefecture.code);
  } else {
    detailMap.hoverPrefecture(null);
  }
});
```

### アニメーション付き選択

```javascript
// CSSアニメーションと組み合わせた選択
map.on('prefectureSelected', (prefecture) => {
  // SVGパスを取得
  const path = document.querySelector(
    `[data-prefecture="${prefecture.code}"]`
  );
  
  if (path) {
    // アニメーションクラスを追加
    path.classList.add('selected-animation');
    
    // アニメーション終了後にクラスを削除
    setTimeout(() => {
      path.classList.remove('selected-animation');
    }, 1000);
  }
});
```

```css
.selected-animation {
  animation: pulse 1s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

## エラーハンドリング

```javascript
// 初期化エラーの処理
try {
  await map.initialize(prefectureUrl, municipalityUrl);
} catch (error) {
  console.error('地図の初期化に失敗しました:', error);
  
  // ユーザーに通知
  showErrorMessage('地図データの読み込みに失敗しました');
}

// 選択エラーの処理
map.on('municipalitySelected', async (municipality) => {
  try {
    const response = await fetch(`/api/data/${municipality.code}`);
    if (!response.ok) throw new Error('データ取得失敗');
    
    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error('データ取得エラー:', error);
    showErrorMessage('詳細データを取得できませんでした');
  }
});
```