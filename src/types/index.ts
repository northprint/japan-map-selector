// 地理データの型定義

// GeoJSON関連の型定義
export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    N03_001: string; // 都道府県名
    N03_002?: string; // 支庁名
    N03_003?: string; // 郡・政令都市名
    N03_004?: string; // 市区町村名
    N03_007: string; // 行政区域コード
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// 都道府県データ
export interface Prefecture {
  code: string;
  name: string;
  bounds: [[number, number], [number, number]]; // [[西, 南], [東, 北]]
  feature: GeoJSONFeature;
}

// 市区町村データ
export interface Municipality {
  code: string;
  name: string;
  prefectureCode: string;
  feature: GeoJSONFeature;
}

// コンポーネントのプロパティ
export interface JapanMapSelectorProps {
  onPrefectureSelect?: (prefecture: Prefecture) => void;
  onMunicipalitySelect?: (municipality: Municipality) => void;
  width?: number;
  height?: number;
  prefectureColor?: string;
  prefectureHoverColor?: string;
  municipalityColor?: string;
  municipalityHoverColor?: string;
  selectedPrefectureCode?: string;
  selectedMunicipalityCode?: string;
}

// 内部状態
export interface MapState {
  selectedPrefecture: Prefecture | null;
  hoveredPrefecture: Prefecture | null;
  hoveredMunicipality: Municipality | null;
  viewBox: string;
  scale: number;
  translateX: number;
  translateY: number;
  showTokyoIslands?: boolean; // 東京都の離島表示フラグ
}