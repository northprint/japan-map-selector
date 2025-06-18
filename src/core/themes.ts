// カラーテーマの定義

import { ColorTheme } from '../types';

export const themes: Record<string, ColorTheme> = {
  default: {
    name: 'デフォルト',
    prefectureFill: '#e0e0e0',
    prefectureStroke: '#999',
    prefectureHoverFill: '#b0d0f0',
    prefectureSelectedFill: '#90c0ff',
    municipalityFill: '#f0f0f0',
    municipalityStroke: '#666',
    municipalityHoverFill: '#b0d0f0',
    municipalitySelectedFill: '#90c0ff',
    backgroundColor: '#f8f8f8',
    strokeWidth: 0.5
  },
  
  dark: {
    name: 'ダーク',
    prefectureFill: '#2a2a2a',
    prefectureStroke: '#555',
    prefectureHoverFill: '#404040',
    prefectureSelectedFill: '#505050',
    municipalityFill: '#333333',
    municipalityStroke: '#555',
    municipalityHoverFill: '#404040',
    municipalitySelectedFill: '#505050',
    backgroundColor: '#1a1a1a',
    strokeWidth: 0.5
  },
  
  warm: {
    name: 'ウォーム',
    prefectureFill: '#ffe0cc',
    prefectureStroke: '#cc9966',
    prefectureHoverFill: '#ffcc99',
    prefectureSelectedFill: '#ff9966',
    municipalityFill: '#fff0e6',
    municipalityStroke: '#cc9966',
    municipalityHoverFill: '#ffcc99',
    municipalitySelectedFill: '#ff9966',
    backgroundColor: '#fff5f0',
    strokeWidth: 0.5
  },
  
  cool: {
    name: 'クール',
    prefectureFill: '#d0e8f2',
    prefectureStroke: '#6699cc',
    prefectureHoverFill: '#a0d0f0',
    prefectureSelectedFill: '#6699ff',
    municipalityFill: '#e8f4f8',
    municipalityStroke: '#6699cc',
    municipalityHoverFill: '#a0d0f0',
    municipalitySelectedFill: '#6699ff',
    backgroundColor: '#f0f8ff',
    strokeWidth: 0.5
  },
  
  monochrome: {
    name: 'モノクローム',
    prefectureFill: '#f0f0f0',
    prefectureStroke: '#333',
    prefectureHoverFill: '#ddd',
    prefectureSelectedFill: '#ccc',
    municipalityFill: '#f8f8f8',
    municipalityStroke: '#333',
    municipalityHoverFill: '#ddd',
    municipalitySelectedFill: '#ccc',
    backgroundColor: '#fff',
    strokeWidth: 0.8
  },
  
  colorful: {
    name: 'カラフル',
    prefectureFill: '#ff6b6b',  // この値は実際には使われない（getPrefectureFillで上書き）
    prefectureStroke: '#fff',
    prefectureHoverFill: '#4ecdc4',
    prefectureSelectedFill: '#45b7d1',
    municipalityFill: '#fff3e0',
    municipalityStroke: '#ff6b6b',
    municipalityHoverFill: '#ffe0b2',
    municipalitySelectedFill: '#ffcc80',
    backgroundColor: '#fafafa',
    strokeWidth: 1.0
  },
  
  random: {
    name: 'ランダム',
    prefectureFill: '#808080',  // この値は実際には使われない（getPrefectureFillで上書き）
    prefectureStroke: '#333',
    prefectureHoverFill: '#666',
    prefectureSelectedFill: '#444',
    municipalityFill: '#f0f0f0',
    municipalityStroke: '#666',
    municipalityHoverFill: '#e0e0e0',
    municipalitySelectedFill: '#d0d0d0',
    backgroundColor: '#f8f8f8',
    strokeWidth: 0.8
  }
};

// テーマを取得する関数
export function getTheme(themeNameOrObject: ColorTheme | string | undefined): ColorTheme {
  if (!themeNameOrObject) {
    return themes.default;
  }
  
  if (typeof themeNameOrObject === 'string') {
    return themes[themeNameOrObject] || themes.default;
  }
  
  // カスタムテーマの場合はそのまま返す
  return themeNameOrObject;
}

// 個別の色設定を適用する関数
export function applyColorOverrides(theme: ColorTheme, props: any): ColorTheme {
  return {
    ...theme,
    prefectureFill: props.prefectureColor || theme.prefectureFill,
    prefectureHoverFill: props.prefectureHoverColor || theme.prefectureHoverFill,
    municipalityFill: props.municipalityColor || theme.municipalityFill,
    municipalityHoverFill: props.municipalityHoverColor || theme.municipalityHoverFill
  };
}

// カラフルな色のパレット
const colorfulPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE',
  '#85C1E2', '#F8B500', '#6C5CE7', '#FD79A8', '#FDCB6E',
  '#6AB04C', '#EB4D4B', '#22A6B3', '#F0932B', '#EB4D4B',
  '#686DE0', '#30336B', '#F9CA24', '#F0932B', '#EB4D4B',
  '#6AB04C', '#BAD7E9', '#2BCBBA', '#FEA47F', '#25CCF7',
  '#FD7272', '#54A0FF', '#00D2D3', '#1ABC9C', '#2ECC71',
  '#3498DB', '#9B59B6', '#34495E', '#16A085', '#27AE60',
  '#2980B9', '#8E44AD', '#2C3E50', '#F39C12', '#E67E22',
  '#E74C3C', '#ECF0F1', '#95A5A6', '#D0B41A', '#A29BFE'
];

// 都道府県コードから色を生成する関数
export function getPrefectureFillColor(prefectureCode: string, themeName: string): string {
  if (themeName === 'colorful') {
    // 都道府県コードを数値に変換してインデックスとして使用
    const index = parseInt(prefectureCode, 10) - 1;
    return colorfulPalette[index % colorfulPalette.length];
  } else if (themeName === 'random') {
    // 都道府県コードを基にした疑似ランダム色を生成
    const seed = parseInt(prefectureCode, 10);
    const hue = (seed * 137.5) % 360; // 黄金角を使用して均等に分布
    const saturation = 65 + (seed % 20); // 65-85%
    const lightness = 45 + (seed % 20);  // 45-65%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  // その他のテーマはデフォルトの色を返す
  return themes[themeName]?.prefectureFill || themes.default.prefectureFill;
}

// 16進数カラーをRGBに変換
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// 色を明るくする関数
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * percent));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * percent));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * percent));
  
  return `rgb(${r}, ${g}, ${b})`;
}

// 市区町村の色を生成する関数
export function getMunicipalityFillColor(municipalityCode: string, prefectureCode: string, themeName: string): string {
  if (themeName === 'colorful') {
    // 都道府県の色を基準に、明るい色を生成
    const prefectureColor = getPrefectureFillColor(prefectureCode, themeName);
    return lightenColor(prefectureColor, 0.7); // 70%明るくする
  } else if (themeName === 'random') {
    // 市区町村コードを基にした色を生成
    const seed = parseInt(municipalityCode.slice(-3), 10); // 下3桁を使用
    const prefSeed = parseInt(prefectureCode, 10);
    const baseHue = (prefSeed * 137.5) % 360;
    const hue = (baseHue + seed * 15) % 360; // 都道府県の色相から少しずらす
    const saturation = 50 + (seed % 20); // 50-70% (都道府県より薄め)
    const lightness = 65 + (seed % 15);  // 65-80% (都道府県より明るめ)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  // その他のテーマはデフォルトの色を返す
  return themes[themeName]?.municipalityFill || themes.default.municipalityFill;
}

// 市区町村のホバー色を生成する関数
export function getMunicipalityHoverFillColor(municipalityCode: string, prefectureCode: string, themeName: string): string {
  if (themeName === 'colorful') {
    // 市区町村の通常色を少し暗くする
    const baseColor = getMunicipalityFillColor(municipalityCode, prefectureCode, themeName);
    // RGBカラーから少し暗くする
    const match = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = Math.max(0, parseInt(match[1]) - 30);
      const g = Math.max(0, parseInt(match[2]) - 30);
      const b = Math.max(0, parseInt(match[3]) - 30);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return themes.colorful.municipalityHoverFill;
  } else if (themeName === 'random') {
    // ランダムテーマの場合もHSLで少し暗くする
    const baseColor = getMunicipalityFillColor(municipalityCode, prefectureCode, themeName);
    const match = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = Math.max(30, parseInt(match[3]) - 15); // 明度を15%下げる
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    return themes.random.municipalityHoverFill;
  }
  
  // その他のテーマはデフォルトのホバー色を返す
  return themes[themeName]?.municipalityHoverFill || themes.default.municipalityHoverFill;
}