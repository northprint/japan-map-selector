# japan-map-selector

Interactive Japan map component for selecting prefectures and municipalities. Built with TypeScript and supports React, Svelte, and vanilla JavaScript.

[日本語版はこちら](#日本語)

![npm version](https://img.shields.io/npm/v/japan-map-selector.svg)
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

const selector = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'default'
});

// Load map data
await selector.initialize(
  'path/to/prefectures.geojson',
  'path/to/municipalities.geojson'
);

// Listen for selection events
selector.on('prefectureSelected', (prefecture) => {
  console.log('Selected prefecture:', prefecture.name);
});

selector.on('municipalitySelected', (municipality) => {
  console.log('Selected municipality:', municipality.name);
});

// Render the map
const mapContainer = document.getElementById('map');
mapContainer.innerHTML = selector.render();
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
  prefectureDataUrl="/data/prefectures.geojson"
  municipalityDataUrl="/data/municipalities.geojson"
/>
```

## Map Data

This package includes map data derived from the National Land Numerical Information (国土数値情報) provided by the Ministry of Land, Infrastructure, Transport and Tourism of Japan.

The data files are located in `src/data/`:
- `prefectures.geojson` - Prefecture boundaries
- `municipalities.geojson` - Municipality boundaries

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