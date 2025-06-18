# カスタマイズ

Japan Map Selectorは様々なカスタマイズオプションを提供しています。

## 色のカスタマイズ

### 個別の色設定

テーマを使用せずに個別に色を設定できます：

```javascript
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  prefectureColor: '#3498db',
  prefectureHoverColor: '#2980b9',
  municipalityColor: '#e74c3c',
  municipalityHoverColor: '#c0392b'
});
```

### カスタムテーマの作成

独自のテーマオブジェクトを定義できます：

```javascript
const customTheme = {
  name: 'my-theme',
  prefectureFill: '#3498db',
  prefectureStroke: '#2c3e50',
  prefectureHoverFill: '#2980b9',
  prefectureSelectedFill: '#1abc9c',
  municipalityFill: '#e74c3c',
  municipalityStroke: '#34495e',
  municipalityHoverFill: '#c0392b',
  municipalitySelectedFill: '#e67e22',
  backgroundColor: '#ecf0f1',
  strokeWidth: 1.5
};

const map = new JapanMapSelector({
  theme: customTheme
});
```

## サイズとレイアウト

地図のサイズを設定できます：

```javascript
const map = new JapanMapSelector({
  width: 1200,
  height: 800
});
```

レスポンシブ対応の例：

```javascript
function createResponsiveMap() {
  const container = document.getElementById('map-container');
  const width = container.offsetWidth;
  const height = width * 0.75; // アスペクト比 4:3
  
  return new JapanMapSelector({
    width,
    height
  });
}
```

## 選択可能な都道府県の制限

特定の都道府県のみ選択可能にする：

```javascript
const map = new JapanMapSelector({
  // 関東地方のみ選択可能
  selectablePrefectures: ['08', '09', '10', '11', '12', '13', '14'],
  // 選択不可の都道府県の色
  disabledPrefectureFill: '#cccccc',
  disabledPrefectureStroke: '#999999'
});
```

## 簡略化レベルの調整

地図データの詳細度を調整：

```javascript
const map = new JapanMapSelector({
  // 'original' | 'high' | 'medium' | 'low' | 'ultra-low'
  simplificationLevel: 'medium'
});
```

## ディフォルメ機能

地図を抽象的に表現：

```javascript
// グリッドベースのディフォルメ
map.setDeformMode('grid', 0.1); // gridSize: 0.1

// 六角形グリッドのディフォルメ
map.setDeformMode('hexagon', 0.15); // gridSize: 0.15

// ディフォルメを解除
map.setDeformMode('none');
```

## 出典表示のカスタマイズ

国土数値情報の出典表示をカスタマイズ：

```javascript
const map = new JapanMapSelector({
  showAttribution: true,
  attributionOptions: {
    showLink: true,
    position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    style: {
      fontSize: '12px',
      color: '#666',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '4px 8px'
    }
  }
});
```

## イベントハンドラのカスタマイズ

選択時の動作をカスタマイズ：

```javascript
const map = new JapanMapSelector({
  onPrefectureSelect: (prefecture) => {
    // カスタムアニメーション
    animateSelection(prefecture);
    
    // データの取得
    fetchPrefectureData(prefecture.code);
    
    // UIの更新
    updateSidebar(prefecture);
  },
  
  onMunicipalitySelect: (municipality) => {
    // ポップアップ表示
    showPopup(municipality);
  }
});
```

## アニメーションのカスタマイズ

CSSトランジションを使用したアニメーション：

```css
/* SVGパスにトランジションを追加 */
.japan-map-selector svg path {
  transition: fill 0.3s ease, stroke 0.3s ease;
}

/* ホバー時のアニメーション */
.japan-map-selector svg path:hover {
  transform: scale(1.02);
  transform-origin: center;
}
```

## 高度なカスタマイズ

### カスタムレンダラー

独自のレンダリング処理を実装：

```javascript
class CustomMapRenderer {
  constructor(selector) {
    this.selector = selector;
    this.selector.on('stateChanged', () => this.render());
  }
  
  render() {
    const state = this.selector.getState();
    const prefectures = this.selector.getPrefectures();
    
    // カスタムレンダリング処理
    // WebGL、Canvas、またはカスタムSVG処理など
  }
}
```

### プラグインシステム

機能を拡張するプラグイン例：

```javascript
class SearchPlugin {
  constructor(selector) {
    this.selector = selector;
    this.createSearchUI();
  }
  
  createSearchUI() {
    // 検索UIを作成
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '都道府県・市区町村を検索...';
    
    searchBox.addEventListener('input', (e) => {
      this.search(e.target.value);
    });
  }
  
  search(query) {
    // 検索ロジック
    const prefectures = this.selector.getPrefectures();
    const match = prefectures.find(p => 
      p.name.includes(query)
    );
    
    if (match) {
      this.selector.selectPrefecture(match.code);
    }
  }
}
```