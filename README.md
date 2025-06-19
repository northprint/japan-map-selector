# japan-map-selector

Interactive Japan map component for selecting prefectures and municipalities. Built with TypeScript and supports React, Svelte, and vanilla JavaScript.

[日本語版はこちら](#日本語)

![npm version](https://img.shields.io/npm/v/japan-map-selector.svg)
![Bundle Size](https://img.shields.io/badge/bundle%20size-~200KB-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)

## Features

- 🗾 Interactive map of Japan with all prefectures
- 🏘️ Drill-down to municipality level selection
- 🎨 Multiple themes (default, dark, colorful)
- ⚡ Framework agnostic - works with React, Svelte, or vanilla JS
- 📱 Responsive and touch-friendly
- 🗜️ Adjustable simplification levels for performance
- 🔄 Grid and hexagonal deformation modes
- 🏝️ Special handling for Tokyo islands
- 📍 Okinawa displayed in separate inset

## Demo

- 📚 [Documentation](https://northprint.github.io/japan-map-selector/) (After GitHub Pages is enabled)
- 🎮 [Live Demo](https://northprint.github.io/japan-map-selector/demo) (After GitHub Pages is enabled)

To run the demo locally:

```bash
# Start a local server
python3 -m http.server 8000
# or
npx http-server -p 8000

# Open http://localhost:8000/demo.html
```

## Installation

```bash
npm install japan-map-selector
```

## Quick Start

### Vanilla JavaScript

```javascript
import { JapanMapSelector } from 'japan-map-selector';

// セレクターを作成
const selector = new JapanMapSelector({
  width: 800,
  height: 600,
  onPrefectureSelect: (prefecture) => {
    console.log('Selected prefecture:', prefecture.name);
  },
  onMunicipalitySelect: (municipality) => {
    console.log('Selected municipality:', municipality.name);
  }
});

// データを読み込んで初期化
// CDN経由でデータを読み込む場合（推奨）
const baseUrl = 'https://unpkg.com/japan-map-selector@latest/src/data/simplified';
await selector.initialize(
  `${baseUrl}/prefectures-medium.geojson`,
  `${baseUrl}/municipalities-medium.geojson`
);

// SVGコンテンツを取得して表示
const svgElement = document.getElementById('map-svg');
selector.on('stateChanged', (state) => {
  svgElement.innerHTML = state.svgContent;
});
```

完全な実装例は [examples/vanilla-js/](examples/vanilla-js/) を参照してください。

### CDN Usage

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Japan Map Selector - CDN Example</title>
</head>
<body>
  <svg id="map-svg" width="800" height="600"></svg>
  
  <script type="module">
    // CDNから読み込み
    import { JapanMapSelector } from 'https://unpkg.com/japan-map-selector@latest/dist/index.es.js';
    
    const selector = new JapanMapSelector({
      width: 800,
      height: 600
    });
    
    // CDN経由でデータを読み込み
    const baseUrl = 'https://unpkg.com/japan-map-selector@latest/src/data/simplified';
    await selector.initialize(
      `${baseUrl}/prefectures-medium.geojson`,
      `${baseUrl}/municipalities-medium.geojson`
    );
    
    // 状態変更を監視して描画
    const svg = document.getElementById('map-svg');
    selector.on('stateChanged', (state) => {
      svg.innerHTML = state.svgContent;
    });
  </script>
</body>
</html>
```

### React

```jsx
import { JapanMapSelectorReact } from 'japan-map-selector';

function MapComponent() {
  const handlePrefectureSelect = (prefecture) => {
    console.log('Selected:', prefecture.name);
  };

  return (
    <JapanMapSelectorReact
      width={800}
      height={600}
      theme="default"
      onPrefectureSelected={handlePrefectureSelect}
      prefectureDataUrl="/data/prefectures.geojson"
      municipalityDataUrl="/data/municipalities.geojson"
    />
  );
}
```

### Svelte

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector';
  
  function handlePrefectureSelect(event) {
    console.log('Selected:', event.detail.name);
  }
</script>

<JapanMapSelectorSvelte
  width={800}
  height={600}
  theme="default"
  on:prefectureSelected={handlePrefectureSelect}
  prefectureDataUrl="/data/prefectures-medium.geojson"
  municipalityDataUrl="/data/municipalities-medium.geojson"
/>
```

## Map Data

This package includes map data derived from the National Land Numerical Information (国土数値情報) provided by the Ministry of Land, Infrastructure, Transport and Tourism of Japan.

### Default Data (Included)

The package includes medium precision data by default:
- Prefecture boundaries: 272KB
- Municipality boundaries: 2.0MB
- **Total size: ~2.3MB**

### Using Default Data

The default medium precision data is automatically included. You can use relative paths:

```javascript
// Using default data (medium precision)
await map.initialize(
  './node_modules/japan-map-selector/src/data/simplified/prefectures-medium.geojson',
  './node_modules/japan-map-selector/src/data/simplified/municipalities-medium.geojson'
);
```

Or with a bundler that resolves node_modules:

```javascript
import prefectureData from 'japan-map-selector/src/data/simplified/prefectures-medium.geojson';
import municipalityData from 'japan-map-selector/src/data/simplified/municipalities-medium.geojson';

await map.initialize(prefectureData, municipalityData);
```

### Optional Data Packages

For other precision levels, install additional packages:

| Package | Install Command | Total Size | Use Case |
|---------|----------------|------------|----------|
| Original (Highest) | `npm install japan-map-selector-data-original` | ~10.7MB | Detailed analysis |
| High | `npm install japan-map-selector-data-high` | ~4.1MB | Better quality |
| Low | `npm install japan-map-selector-data-low` | ~1.3MB | Mobile apps |
| Ultra Low | `npm install japan-map-selector-data-ultra-low` | ~696KB | Previews |

**Note: These optional packages are not yet published. For now, only medium precision data is available.**

## Performance Optimization

### Option 1: Use Low Precision Data

For faster initial load times, use low precision data:

```javascript
// Use low precision data (60% smaller, loads 2-3x faster)
await map.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/municipalities-low.geojson'
);
```

Benefits:
- **File size**: ~1.3MB (vs 2.3MB for medium precision)
- **Initial load**: 1-2 seconds (vs 3-5 seconds)
- **Cached load**: 0.1-0.3 seconds
- **Visual quality**: Good for most use cases

### Option 2: Dynamic Prefecture-based Loading (v0.2.0+)

Load municipality data only when a prefecture is selected:

```javascript
const selector = new JapanMapSelector({
  width: 800,
  height: 600,
  enableDynamicLoading: true, // Enable dynamic loading
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data',
  onMunicipalityLoadStart: (prefecture) => {
    console.log(`Loading ${prefecture.name} municipalities...`);
  },
  onMunicipalityLoadEnd: (prefecture) => {
    console.log(`Loaded ${prefecture.name} municipalities`);
  }
});

// Initialize with prefecture data only
await selector.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  '' // Municipality URL can be empty with dynamic loading
);
```

Benefits:
- **Initial load**: ~100KB (prefectures only)
- **Per-prefecture load**: 10-200KB (on demand)
- **Total bandwidth**: Only loads what's needed
- **Memory efficient**: Unloaded data doesn't consume memory

## API Reference

### Options

```typescript
interface JapanMapSelectorProps {
  width?: number;              // Map width (default: 800)
  height?: number;             // Map height (default: 600)
  theme?: string | ColorTheme; // Theme name or custom theme object
  simplificationLevel?: number; // 0.1 (detailed) to 1.0 (simplified)
  showTokyoIslands?: boolean;  // Show/hide Tokyo remote islands
  enableZoom?: boolean;        // Enable zoom functionality
  enablePan?: boolean;         // Enable pan functionality
}
```

### Events

- `prefectureSelected` - Fired when a prefecture is selected
- `municipalitySelected` - Fired when a municipality is selected
- `selectionCleared` - Fired when selection is cleared

### Methods

- `setTheme(theme)` - Change the color theme
- `setSimplificationLevel(level)` - Adjust map detail level
- `setDeformMode(mode)` - Set deformation mode ('none', 'grid', 'hexagon')
- `reset()` - Reset to initial view
- `selectPrefecture(code)` - Programmatically select a prefecture
- `zoomIn()` / `zoomOut()` - Zoom controls

## Themes

Built-in themes:
- `default` - Clean, minimalist design
- `dark` - Dark mode
- `colorful` - Vibrant colors

Custom theme example:

```javascript
const customTheme = {
  background: '#f0f0f0',
  prefectureFill: '#ffffff',
  prefectureStroke: '#333333',
  prefectureHoverFill: '#ffff00',
  municipalityFill: '#e0e0e0',
  municipalityStroke: '#666666',
  strokeWidth: 0.5
};

selector.setTheme(customTheme);
```

## Examples

See the `examples/` directory for complete examples:
- Basic usage with vanilla JavaScript
- React integration with hooks
- Svelte component with reactive data
- Custom theming and data visualization

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the library
npm run build

# Run type checking
npm run type-check

# View documentation
npm run docs:dev
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details.

## Attribution

This library uses map data from:
- National Land Numerical Information (国土数値情報) by MLIT Japan
- [Attribution details](./ATTRIBUTION.md)

---

<a name="日本語"></a>

# japan-map-selector (日本語版)

日本の都道府県・市区町村を選択できるインタラクティブな地図コンポーネント。TypeScriptで構築され、React、Svelte、vanilla JavaScriptをサポート。

## 特徴

- 🗾 全都道府県を含む日本のインタラクティブマップ
- 🏘️ 市区町村レベルまでドリルダウン可能
- 🎨 複数のテーマ（デフォルト、ダーク、カラフル）
- ⚡ フレームワーク非依存 - React、Svelte、vanilla JSで動作
- 📱 レスポンシブでタッチ操作対応
- 🗜️ パフォーマンスのための簡略化レベル調整可能
- 🔄 グリッド・六角形のデフォルメモード
- 🏝️ 東京都の離島の特別な処理
- 📍 沖縄県を別枠で表示

## インストール

```bash
npm install japan-map-selector
```

## 使用例

[上記の英語版を参照](#quick-start)

## 地図データ

本パッケージには、国土交通省国土数値情報ダウンロードサービスから提供されている行政区域データを加工したものが含まれています。

## ライセンス

MIT License

## 謝辞

地図データの提供元：
- 国土交通省 国土数値情報（行政区域データ）
- [詳細な帰属情報](./ATTRIBUTION.md)