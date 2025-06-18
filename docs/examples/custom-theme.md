# カスタムテーマ

Japan Map Selectorの外観を自由にカスタマイズする方法を紹介します。

## テーマの基本

### プリセットテーマ一覧

```javascript
// 利用可能なプリセットテーマ
const themes = [
  'default',    // デフォルト（青系）
  'dark',       // ダークモード
  'warm',       // 暖色系
  'cool',       // 寒色系
  'monochrome', // モノクロ
  'colorful',   // カラフル（都道府県ごとに色分け）
  'random'      // ランダム色
];

// テーマを適用
const map = new JapanMapSelector({
  theme: 'dark'
});
```

## カスタムテーマの作成

### ColorTheme インターフェース

```typescript
interface ColorTheme {
  name?: string;
  prefectureFill: string;         // 都道府県の塗りつぶし色
  prefectureStroke: string;       // 都道府県の枠線色
  prefectureHoverFill: string;    // 都道府県のホバー色
  prefectureSelectedFill: string; // 都道府県の選択色
  municipalityFill: string;       // 市区町村の塗りつぶし色
  municipalityStroke: string;     // 市区町村の枠線色
  municipalityHoverFill: string;  // 市区町村のホバー色
  municipalitySelectedFill: string; // 市区町村の選択色
  backgroundColor: string;        // 背景色
  strokeWidth: number;            // 枠線の太さ
}
```

### テーマ例

#### 海洋テーマ

```javascript
const oceanTheme = {
  name: 'ocean',
  prefectureFill: '#0077be',
  prefectureStroke: '#005a9e',
  prefectureHoverFill: '#0099cc',
  prefectureSelectedFill: '#00bfff',
  municipalityFill: '#87ceeb',
  municipalityStroke: '#4682b4',
  municipalityHoverFill: '#add8e6',
  municipalitySelectedFill: '#b0e0e6',
  backgroundColor: '#f0f8ff',
  strokeWidth: 1.5
};

const map = new JapanMapSelector({
  theme: oceanTheme
});
```

#### 森林テーマ

```javascript
const forestTheme = {
  name: 'forest',
  prefectureFill: '#228b22',
  prefectureStroke: '#006400',
  prefectureHoverFill: '#32cd32',
  prefectureSelectedFill: '#00ff00',
  municipalityFill: '#90ee90',
  municipalityStroke: '#228b22',
  municipalityHoverFill: '#98fb98',
  municipalitySelectedFill: '#7fff00',
  backgroundColor: '#f5fffa',
  strokeWidth: 1.2
};
```

#### サイバーパンクテーマ

```javascript
const cyberpunkTheme = {
  name: 'cyberpunk',
  prefectureFill: '#ff00ff',
  prefectureStroke: '#00ffff',
  prefectureHoverFill: '#ff1493',
  prefectureSelectedFill: '#ff69b4',
  municipalityFill: '#9400d3',
  municipalityStroke: '#00ff00',
  municipalityHoverFill: '#ba55d3',
  municipalitySelectedFill: '#ff00ff',
  backgroundColor: '#0a0a0a',
  strokeWidth: 2
};
```

## 動的なテーマ変更

### テーマセレクター

```html
<select id="theme-selector">
  <option value="default">デフォルト</option>
  <option value="ocean">海洋</option>
  <option value="forest">森林</option>
  <option value="cyberpunk">サイバーパンク</option>
</select>
```

```javascript
const themes = {
  default: 'default',
  ocean: oceanTheme,
  forest: forestTheme,
  cyberpunk: cyberpunkTheme
};

document.getElementById('theme-selector').addEventListener('change', (e) => {
  const selectedTheme = themes[e.target.value];
  map.setTheme(selectedTheme);
});
```

### 時間帯による自動切り替え

```javascript
function getTimeBasedTheme() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // 朝: 明るいテーマ
    return {
      name: 'morning',
      prefectureFill: '#fff3cd',
      prefectureStroke: '#ffeeba',
      prefectureHoverFill: '#ffeaa7',
      prefectureSelectedFill: '#ffd93d',
      municipalityFill: '#fff8dc',
      municipalityStroke: '#ffd700',
      municipalityHoverFill: '#fffacd',
      municipalitySelectedFill: '#ffeb3b',
      backgroundColor: '#fffef9',
      strokeWidth: 1
    };
  } else if (hour >= 18 || hour < 6) {
    // 夜: ダークテーマ
    return 'dark';
  } else {
    // 昼: デフォルト
    return 'default';
  }
}

const map = new JapanMapSelector({
  theme: getTimeBasedTheme()
});
```

## 条件付きスタイリング

### データに基づく色分け

```javascript
// 人口密度データ
const populationDensity = {
  '13': 6367,  // 東京都
  '27': 4631,  // 大阪府
  '14': 3816,  // 神奈川県
  // ...
};

// カスタムテーマ生成関数
function createDensityTheme() {
  return {
    name: 'density',
    prefectureFill: '#e0e0e0',
    prefectureStroke: '#999999',
    prefectureHoverFill: '#f0f0f0',
    prefectureSelectedFill: '#ffffff',
    municipalityFill: '#cccccc',
    municipalityStroke: '#888888',
    municipalityHoverFill: '#dddddd',
    municipalitySelectedFill: '#eeeeee',
    backgroundColor: '#fafafa',
    strokeWidth: 1
  };
}

// 色を動的に決定
map.on('stateChanged', (state) => {
  const prefectures = map.getPrefectures();
  prefectures.forEach(prefecture => {
    const density = populationDensity[prefecture.code] || 0;
    const color = getDensityColor(density);
    // カスタムスタイルを適用
    updatePrefectureColor(prefecture.code, color);
  });
});

function getDensityColor(density) {
  if (density > 5000) return '#d32f2f';
  if (density > 2000) return '#f57c00';
  if (density > 1000) return '#fbc02d';
  if (density > 500) return '#689f38';
  return '#388e3c';
}
```

## グラデーションテーマ

### CSS グラデーションの活用

```css
/* グラデーション背景 */
.gradient-map {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* SVGグラデーション定義 */
.japan-map-selector svg defs {
  content: '';
}
```

```javascript
// SVGにグラデーションを追加
function addGradientDefs(svg) {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // 線形グラデーション
  const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  linearGradient.setAttribute('id', 'prefectureGradient');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('style', 'stop-color:#ff6b6b;stop-opacity:1');
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('style', 'stop-color:#4ecdc4;stop-opacity:1');
  
  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  svg.insertBefore(defs, svg.firstChild);
}

// グラデーションテーマ
const gradientTheme = {
  name: 'gradient',
  prefectureFill: 'url(#prefectureGradient)',
  prefectureStroke: '#333333',
  // ...
};
```

## アニメーションテーマ

### パルスアニメーション

```css
@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.animated-theme path {
  animation: pulse 2s ease-in-out infinite;
}

.animated-theme path:hover {
  animation: none;
  transform: scale(1.05);
  transform-origin: center;
}
```

### ネオンテーマ

```javascript
const neonTheme = {
  name: 'neon',
  prefectureFill: 'transparent',
  prefectureStroke: '#00ff00',
  prefectureHoverFill: 'rgba(0, 255, 0, 0.1)',
  prefectureSelectedFill: 'rgba(0, 255, 0, 0.2)',
  municipalityFill: 'transparent',
  municipalityStroke: '#ff00ff',
  municipalityHoverFill: 'rgba(255, 0, 255, 0.1)',
  municipalitySelectedFill: 'rgba(255, 0, 255, 0.2)',
  backgroundColor: '#000000',
  strokeWidth: 2
};

// ネオン効果を追加
const style = document.createElement('style');
style.textContent = `
  .neon-theme path {
    filter: drop-shadow(0 0 3px currentColor);
  }
  .neon-theme path:hover {
    filter: drop-shadow(0 0 6px currentColor) 
            drop-shadow(0 0 10px currentColor);
  }
`;
document.head.appendChild(style);
```

## テーマのエクスポート/インポート

### テーマ設定の保存

```javascript
// テーマをローカルストレージに保存
function saveTheme(theme) {
  localStorage.setItem('japanMapTheme', JSON.stringify(theme));
}

// テーマを読み込み
function loadTheme() {
  const saved = localStorage.getItem('japanMapTheme');
  return saved ? JSON.parse(saved) : 'default';
}

// カスタムテーマエディタ
class ThemeEditor {
  constructor(map) {
    this.map = map;
    this.currentTheme = this.createDefaultTheme();
  }
  
  updateColor(property, color) {
    this.currentTheme[property] = color;
    this.map.setTheme(this.currentTheme);
    saveTheme(this.currentTheme);
  }
  
  exportTheme() {
    const json = JSON.stringify(this.currentTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-map-theme-${Date.now()}.json`;
    a.click();
  }
  
  importTheme(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target.result);
        this.currentTheme = theme;
        this.map.setTheme(theme);
        saveTheme(theme);
      } catch (error) {
        console.error('テーマのインポートに失敗しました:', error);
      }
    };
    reader.readAsText(file);
  }
}
```

## アクセシビリティ対応テーマ

### 高コントラストテーマ

```javascript
const highContrastTheme = {
  name: 'high-contrast',
  prefectureFill: '#ffffff',
  prefectureStroke: '#000000',
  prefectureHoverFill: '#ffff00',
  prefectureSelectedFill: '#00ff00',
  municipalityFill: '#f0f0f0',
  municipalityStroke: '#000000',
  municipalityHoverFill: '#ffff00',
  municipalitySelectedFill: '#00ff00',
  backgroundColor: '#ffffff',
  strokeWidth: 3
};

// 色覚多様性対応
const colorBlindFriendlyTheme = {
  name: 'color-blind-friendly',
  prefectureFill: '#0173B2',
  prefectureStroke: '#333333',
  prefectureHoverFill: '#56B4E9',
  prefectureSelectedFill: '#CC79A7',
  municipalityFill: '#F0E442',
  municipalityStroke: '#333333',
  municipalityHoverFill: '#E69F00',
  municipalitySelectedFill: '#D55E00',
  backgroundColor: '#ffffff',
  strokeWidth: 1.5
};
```