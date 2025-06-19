// データローダー - GeoJSONデータの読み込みと解析

import { 
  GeoJSONFeatureCollection, 
  Prefecture, 
  Municipality 
} from '../types';
import { PREFECTURE_CODES } from './prefecture-codes';
import { DynamicDataLoader } from './dynamic-data-loader';

// 都道府県データの読み込み
export async function loadPrefectureData(url: string): Promise<Prefecture[]> {
  const response = await fetch(url);
  const data: GeoJSONFeatureCollection = await response.json();
  
  return data.features.map((feature) => {
    const bounds = calculateBounds(feature.geometry.coordinates);
    const prefectureName = feature.properties.N03_001;
    // 都道府県名からコードを取得
    const prefectureCode = PREFECTURE_CODES[prefectureName] || '00';
    
    return {
      code: prefectureCode,
      name: prefectureName,
      bounds,
      feature: {
        ...feature,
        properties: {
          ...feature.properties,
          N03_007: prefectureCode
        }
      }
    };
  });
}

// 市区町村データの読み込み
export async function loadMunicipalityData(url: string): Promise<Municipality[]> {
  const response = await fetch(url);
  const data: GeoJSONFeatureCollection = await response.json();
  
  return data.features.map(feature => {
    // N03_007がない場合は都道府県名から推定
    let prefectureCode = '00';
    if (feature.properties.N03_007) {
      prefectureCode = feature.properties.N03_007.substring(0, 2);
    } else if (feature.properties.N03_001) {
      // 都道府県名からコードを取得
      prefectureCode = PREFECTURE_CODES[feature.properties.N03_001] || '00';
    }
    
    const municipalityName = feature.properties.N03_004 || 
                            feature.properties.N03_003 || 
                            feature.properties.N03_002 || '';
    
    // コードがない場合は生成
    const code = feature.properties.N03_007 || `${prefectureCode}999`;
    
    return {
      code,
      name: municipalityName,
      prefectureCode,
      feature
    };
  }).filter(m => m.prefectureCode !== '00'); // 都道府県コードが不明なものは除外
}

// ジオメトリの境界ボックスを計算
function calculateBounds(
  coordinates: number[][][] | number[][][][]
): [[number, number], [number, number]] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processCoordinate = (coord: number[]) => {
    minLng = Math.min(minLng, coord[0]);
    maxLng = Math.max(maxLng, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
  };

  const processPolygon = (polygon: number[][]) => {
    polygon.forEach(processCoordinate);
  };

  // MultiPolygonの場合
  if (Array.isArray(coordinates[0][0][0])) {
    (coordinates as number[][][][]).forEach(polygon => {
      polygon.forEach(processPolygon);
    });
  } else {
    // Polygonの場合
    (coordinates as number[][][]).forEach(processPolygon);
  }

  return [[minLng, minLat], [maxLng, maxLat]];
}

// 都道府県コードから市区町村をフィルタリング
export function filterMunicipalitiesByPrefecture(
  municipalities: Municipality[],
  prefectureCode: string
): Municipality[] {
  return municipalities.filter(m => m.prefectureCode === prefectureCode);
}

// 動的データローダーのインスタンス
let dynamicLoader: DynamicDataLoader | null = null;

// 動的データローダーを初期化
export function initializeDynamicLoader(baseUrl?: string): DynamicDataLoader {
  dynamicLoader = new DynamicDataLoader(baseUrl);
  return dynamicLoader;
}

// 都道府県別の市区町村データを動的に読み込む
export async function loadMunicipalitiesForPrefecture(prefectureCode: string): Promise<Municipality[]> {
  if (!dynamicLoader) {
    throw new Error('Dynamic loader not initialized. Call initializeDynamicLoader first.');
  }
  
  const features = await dynamicLoader.loadMunicipalitiesForPrefecture(prefectureCode);
  
  return features.map(feature => {
    const municipalityName = feature.properties.N03_004 || 
                            feature.properties.N03_003 || 
                            feature.properties.N03_002 || '';
    
    const code = feature.properties.N03_007 || `${prefectureCode}999`;
    
    return {
      code,
      name: municipalityName,
      prefectureCode,
      feature
    };
  });
}

// 動的ローダーの精度を設定
export function setDynamicLoaderPrecision(precision: string): void {
  if (dynamicLoader) {
    dynamicLoader.setPrecision(precision);
  }
}

// 動的ローダーのキャッシュをクリア
export function clearDynamicLoaderCache(prefectureCode?: string): void {
  if (dynamicLoader) {
    dynamicLoader.clearCache(prefectureCode);
  }
}