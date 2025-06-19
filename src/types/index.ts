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

// カラーテーマの定義
export interface ColorTheme {
  name?: string;
  prefectureFill: string;
  prefectureStroke: string;
  prefectureHoverFill: string;
  prefectureSelectedFill: string;
  municipalityFill: string;
  municipalityStroke: string;
  municipalityHoverFill: string;
  municipalitySelectedFill: string;
  backgroundColor: string;
  strokeWidth: number;
}

// コンポーネントのプロパティ
export interface JapanMapSelectorProps {
  onPrefectureSelect?: (prefecture: Prefecture) => void;
  onMunicipalitySelect?: (municipality: Municipality) => void;
  width?: number;
  height?: number;
  theme?: ColorTheme | 'default' | 'dark' | 'warm' | 'cool' | 'monochrome' | 'colorful' | 'random';
  // 個別のカラー設定（themeより優先）
  prefectureColor?: string;
  prefectureHoverColor?: string;
  municipalityColor?: string;
  municipalityHoverColor?: string;
  selectedPrefectureCode?: string;
  selectedMunicipalityCode?: string;
  // クリック可能な都道府県を制限（未指定の場合は全て選択可能）
  selectablePrefectures?: string[];
  // 選択不可の都道府県の色
  disabledPrefectureFill?: string;
  disabledPrefectureStroke?: string;
  // ポリゴンの簡略化レベル
  simplificationLevel?: 'original' | 'high' | 'medium' | 'low' | 'ultra-low';
  // パフォーマンスオプション
  lazyLoadMunicipalities?: boolean; // 市区町村データを遅延読み込みするか（デフォルト: false）
  preloadMunicipalitiesDelay?: number; // 初回ロード後、何ミリ秒後に市区町村データを事前読み込みするか（デフォルト: 3000）
  // 都道府県別データの動的読み込みを有効化
  enableDynamicLoading?: boolean;
  // 動的データのベースURL
  dynamicDataBaseUrl?: string;
  // データ読み込みコールバック
  onMunicipalityLoadStart?: (prefecture?: Prefecture) => void; // 市区町村データ読み込み開始時
  onMunicipalityLoadEnd?: (prefecture?: Prefecture) => void; // 市区町村データ読み込み終了時
  // 出典表示の設定
  showAttribution?: boolean;
  attributionOptions?: {
    showLink?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    style?: any;
  };
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