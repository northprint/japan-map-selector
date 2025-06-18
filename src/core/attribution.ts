// 国土数値情報の出典表示用ユーティリティ

export interface AttributionOptions {
  showLink?: boolean;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * 国土数値情報の出典表示テキストを取得
 */
export function getAttributionText(): string {
  return '地図データ：「国土数値情報（行政区域データ）」（国土交通省）を加工して作成';
}

/**
 * 国土数値情報の出典表示HTMLを取得
 */
export function getAttributionHTML(options: AttributionOptions = {}): string {
  const { showLink = true, className = 'japan-map-attribution' } = options;
  
  if (showLink) {
    return `<div class="${className}">地図データ：<a href="https://nlftp.mlit.go.jp/ksj/index.html" target="_blank" rel="noopener">国土数値情報（行政区域データ）</a>（国土交通省）を加工して作成</div>`;
  } else {
    return `<div class="${className}">地図データ：「国土数値情報（行政区域データ）」（国土交通省）を加工して作成</div>`;
  }
}

/**
 * 出典表示用のDOM要素を作成
 */
export function createAttributionElement(options: AttributionOptions = {}): HTMLElement {
  const { showLink = true, className = 'japan-map-attribution', style = {} } = options;
  
  const div = document.createElement('div');
  div.className = className;
  
  // デフォルトスタイル
  const defaultStyle: Partial<CSSStyleDeclaration> = {
    fontSize: '12px',
    color: '#666',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '4px',
    margin: '4px',
    ...style
  };
  
  // スタイルを適用
  Object.assign(div.style, defaultStyle);
  
  if (showLink) {
    div.innerHTML = '地図データ：<a href="https://nlftp.mlit.go.jp/ksj/index.html" target="_blank" rel="noopener" style="color: #0066cc; text-decoration: none;">国土数値情報（行政区域データ）</a>（国土交通省）を加工して作成';
  } else {
    div.textContent = getAttributionText();
  }
  
  return div;
}

/**
 * SVG要素に出典表示を追加
 */
export function addAttributionToSVG(svg: SVGSVGElement, options: {
  x?: number;
  y?: number;
  fontSize?: number;
  fill?: string;
} = {}): void {
  const svgElement = svg as SVGSVGElement;
  const defaultY = svgElement.viewBox?.baseVal?.height ? svgElement.viewBox.baseVal.height - 10 : 590;
  
  const {
    x = 10,
    y = defaultY,
    fontSize = 10,
    fill = '#666'
  } = options;
  
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x.toString());
  text.setAttribute('y', y.toString());
  text.setAttribute('font-size', fontSize.toString());
  text.setAttribute('fill', fill);
  text.setAttribute('font-family', 'sans-serif');
  text.textContent = getAttributionText();
  
  svg.appendChild(text);
}

/**
 * React用の出典表示コンポーネントのプロパティ
 */
export interface AttributionProps {
  showLink?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 出典表示用のデフォルトCSS
 */
export const attributionCSS = `
.japan-map-attribution {
  font-size: 12px;
  color: #666;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  margin: 4px;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1000;
}

.japan-map-attribution a {
  color: #0066cc;
  text-decoration: none;
}

.japan-map-attribution a:hover {
  text-decoration: underline;
}

/* ダークテーマ用 */
.japan-map-attribution.dark {
  background-color: rgba(0, 0, 0, 0.8);
  color: #ccc;
}

.japan-map-attribution.dark a {
  color: #66b3ff;
}
`;