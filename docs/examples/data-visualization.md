# データ可視化

Japan Map Selectorを使用して、様々なデータを地図上に可視化する方法を紹介します。

## 基本的な可視化

### 人口データの可視化

```javascript
// 都道府県別人口データ（2020年国勢調査）
const populationData = {
  '13': 14047594, // 東京都
  '27': 8837685,  // 大阪府
  '14': 9237337,  // 神奈川県
  '23': 7542415,  // 愛知県
  '11': 7344765,  // 埼玉県
  // ... 他の都道府県
};

// 人口に基づいて色を決定
function getColorByPopulation(prefectureCode) {
  const population = populationData[prefectureCode] || 0;
  
  if (population > 10000000) return '#800026';
  if (population > 7000000) return '#BD0026';
  if (population > 5000000) return '#E31A1C';
  if (population > 3000000) return '#FC4E2A';
  if (population > 2000000) return '#FD8D3C';
  if (population > 1000000) return '#FEB24C';
  if (population > 500000) return '#FED976';
  return '#FFEDA0';
}

// カスタムテーマを作成
const populationTheme = {
  name: 'population',
  prefectureFill: '#FFEDA0', // デフォルト色
  prefectureStroke: '#666',
  prefectureHoverFill: '#666',
  prefectureSelectedFill: '#333',
  municipalityFill: '#ccc',
  municipalityStroke: '#999',
  municipalityHoverFill: '#aaa',
  municipalitySelectedFill: '#888',
  backgroundColor: '#f7f7f7',
  strokeWidth: 1
};
```

### コロプレスマップの実装

```javascript
class ChoroplethMap {
  constructor(containerId) {
    this.map = new JapanMapSelector({
      width: 800,
      height: 600,
      theme: populationTheme
    });
    
    this.data = {};
    this.colorScale = null;
  }
  
  async initialize() {
    await this.map.initialize(
      '/data/prefectures.json',
      '/data/municipalities.json'
    );
    
    this.setupColorScale();
    this.render();
  }
  
  setData(data) {
    this.data = data;
    this.setupColorScale();
    this.render();
  }
  
  setupColorScale() {
    const values = Object.values(this.data);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // D3.jsのようなスケール関数
    this.colorScale = (value) => {
      const normalized = (value - min) / (max - min);
      return this.interpolateColor(normalized);
    };
  }
  
  interpolateColor(t) {
    // 青から赤へのグラデーション
    const r = Math.round(255 * t);
    const b = Math.round(255 * (1 - t));
    return `rgb(${r}, 0, ${b})`;
  }
  
  render() {
    // 各都道府県に色を適用
    const prefectures = this.map.getPrefectures();
    prefectures.forEach(prefecture => {
      const value = this.data[prefecture.code];
      if (value !== undefined) {
        const color = this.colorScale(value);
        this.applyColor(prefecture.code, color);
      }
    });
  }
}
```

## 時系列データの可視化

### アニメーション付き変化

```javascript
class TimeSeriesMap {
  constructor() {
    this.map = new JapanMapSelector({
      width: 800,
      height: 600
    });
    
    this.timeSeriesData = {};
    this.currentYear = 2020;
    this.isPlaying = false;
  }
  
  async loadTimeSeriesData() {
    // 年ごとのデータを読み込み
    for (let year = 2010; year <= 2020; year++) {
      const response = await fetch(`/data/population-${year}.json`);
      this.timeSeriesData[year] = await response.json();
    }
  }
  
  play() {
    this.isPlaying = true;
    this.animate();
  }
  
  pause() {
    this.isPlaying = false;
  }
  
  animate() {
    if (!this.isPlaying) return;
    
    // 現在の年のデータを表示
    this.updateVisualization(this.currentYear);
    
    // 年を進める
    this.currentYear++;
    if (this.currentYear > 2020) {
      this.currentYear = 2010;
    }
    
    // 次のフレーム
    setTimeout(() => this.animate(), 1000);
  }
  
  updateVisualization(year) {
    const data = this.timeSeriesData[year];
    
    // タイトルを更新
    document.getElementById('year-display').textContent = `${year}年`;
    
    // 地図を更新
    this.map.getPrefectures().forEach(prefecture => {
      const value = data[prefecture.code];
      const color = this.getColorByValue(value);
      this.updatePrefectureColor(prefecture.code, color);
    });
  }
}

// 使用例
const timeSeriesMap = new TimeSeriesMap();
await timeSeriesMap.loadTimeSeriesData();

// コントロール
document.getElementById('play-btn').addEventListener('click', () => {
  timeSeriesMap.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
  timeSeriesMap.pause();
});
```

## 複数指標の可視化

### バブルマップ

```javascript
class BubbleMap {
  constructor() {
    this.map = new JapanMapSelector({
      width: 800,
      height: 600
    });
  }
  
  renderBubbles(data) {
    const svg = document.querySelector('.japan-map-selector svg');
    
    // バブル用のグループを作成
    const bubbleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bubbleGroup.setAttribute('class', 'bubbles');
    
    data.forEach(item => {
      const prefecture = this.map.getPrefectures().find(p => p.code === item.prefectureCode);
      if (!prefecture) return;
      
      // 都道府県の中心点を計算
      const center = this.calculateCenter(prefecture);
      
      // バブルを作成
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', center.x);
      circle.setAttribute('cy', center.y);
      circle.setAttribute('r', this.scaleRadius(item.value));
      circle.setAttribute('fill', this.getColorByCategory(item.category));
      circle.setAttribute('fill-opacity', '0.7');
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '1');
      
      // ツールチップ
      circle.addEventListener('mouseenter', (e) => {
        this.showTooltip(e, item);
      });
      
      bubbleGroup.appendChild(circle);
    });
    
    svg.appendChild(bubbleGroup);
  }
  
  scaleRadius(value) {
    // 値を半径にスケーリング
    const maxRadius = 30;
    const minRadius = 5;
    const maxValue = 1000000;
    
    const scaled = Math.sqrt(value / maxValue) * maxRadius;
    return Math.max(minRadius, Math.min(maxRadius, scaled));
  }
}
```

## ヒートマップ

### 密度表現

```javascript
class HeatmapVisualization {
  constructor() {
    this.map = new JapanMapSelector({
      width: 800,
      height: 600
    });
    
    this.heatmapData = [];
  }
  
  generateHeatmap(points) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // グラデーションを作成
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // 各ポイントを描画
    points.forEach(point => {
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.fillStyle = gradient;
      ctx.fillRect(-20, -20, 40, 40);
      ctx.restore();
    });
    
    // ヒートマップレイヤーとして追加
    return canvas;
  }
  
  overlay(canvas) {
    const container = document.querySelector('.map-container');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.6';
    container.appendChild(canvas);
  }
}
```

## インタラクティブな凡例

### 動的な凡例コンポーネント

```javascript
class InteractiveLegend {
  constructor(map, data) {
    this.map = map;
    this.data = data;
    this.container = document.getElementById('legend');
  }
  
  render() {
    const values = Object.values(this.data);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const legendHTML = `
      <div class="legend-title">人口（万人）</div>
      <div class="legend-scale">
        <div class="legend-gradient"></div>
        <div class="legend-labels">
          <span>${(min / 10000).toFixed(0)}</span>
          <span>${(max / 10000).toFixed(0)}</span>
        </div>
      </div>
      <div class="legend-items">
        ${this.createLegendItems()}
      </div>
    `;
    
    this.container.innerHTML = legendHTML;
    this.addInteractivity();
  }
  
  createLegendItems() {
    const ranges = [
      { min: 0, max: 500000, color: '#FFEDA0', label: '〜50万' },
      { min: 500000, max: 1000000, color: '#FED976', label: '50万〜100万' },
      { min: 1000000, max: 2000000, color: '#FEB24C', label: '100万〜200万' },
      { min: 2000000, max: 5000000, color: '#FD8D3C', label: '200万〜500万' },
      { min: 5000000, max: Infinity, color: '#E31A1C', label: '500万〜' }
    ];
    
    return ranges.map(range => `
      <div class="legend-item" data-min="${range.min}" data-max="${range.max}">
        <span class="legend-color" style="background-color: ${range.color}"></span>
        <span class="legend-label">${range.label}</span>
      </div>
    `).join('');
  }
  
  addInteractivity() {
    // 凡例項目をクリックすると該当する都道府県をハイライト
    document.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const min = parseInt(item.dataset.min);
        const max = parseInt(item.dataset.max);
        this.highlightPrefecturesInRange(min, max);
      });
    });
  }
  
  highlightPrefecturesInRange(min, max) {
    const prefectures = this.map.getPrefectures();
    
    prefectures.forEach(prefecture => {
      const value = this.data[prefecture.code] || 0;
      const isInRange = value >= min && value < max;
      
      // 該当する都道府県を強調表示
      const element = document.querySelector(`[data-prefecture="${prefecture.code}"]`);
      if (element) {
        element.style.opacity = isInRange ? '1' : '0.3';
        element.style.strokeWidth = isInRange ? '2' : '1';
      }
    });
  }
}
```

## データのエクスポート

### 可視化結果の保存

```javascript
class VisualizationExporter {
  constructor(map) {
    this.map = map;
  }
  
  exportAsPNG() {
    const svg = document.querySelector('.japan-map-selector svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `japan-map-${Date.now()}.png`;
        a.click();
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }
  
  exportAsCSV() {
    const data = this.collectVisualizationData();
    const csv = this.convertToCSV(data);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-map-data-${Date.now()}.csv`;
    a.click();
  }
  
  collectVisualizationData() {
    const prefectures = this.map.getPrefectures();
    return prefectures.map(prefecture => ({
      code: prefecture.code,
      name: prefecture.name,
      value: this.getCurrentValue(prefecture.code)
    }));
  }
  
  convertToCSV(data) {
    const header = 'コード,都道府県名,値\n';
    const rows = data.map(row => 
      `${row.code},${row.name},${row.value}`
    ).join('\n');
    
    return header + rows;
  }
}
```

## 実装のヒント

### パフォーマンス最適化

```javascript
// 大量のデータポイントを扱う場合
class OptimizedVisualization {
  constructor() {
    this.renderQueue = [];
    this.isRendering = false;
  }
  
  queueUpdate(prefectureCode, data) {
    this.renderQueue.push({ prefectureCode, data });
    
    if (!this.isRendering) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    this.isRendering = true;
    
    while (this.renderQueue.length > 0) {
      const batch = this.renderQueue.splice(0, 10); // 10件ずつ処理
      
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          batch.forEach(item => {
            this.updatePrefecture(item.prefectureCode, item.data);
          });
          resolve();
        });
      });
    }
    
    this.isRendering = false;
  }
}
```