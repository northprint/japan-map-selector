// 都道府県別データの動的読み込み
import type { GeoJSONFeature } from '../types';

export interface PrefectureDataIndex {
  prefectures: {
    [code: string]: {
      name: string;
      municipalityCount: number;
      files: {
        [precision: string]: {
          path: string;
          size: number;
          features: number;
        }
      }
    }
  };
  generated: string;
  totalSize: {
    original: number;
    compressed: number;
  };
}

// キャッシュの型定義
interface DataCache {
  [key: string]: GeoJSONFeature[];
}

export class DynamicDataLoader {
  private baseUrl: string;
  private cache: DataCache = {};
  private index?: PrefectureDataIndex;
  private currentPrecision: string = 'medium';
  
  constructor(baseUrl: string = './src/data') {
    this.baseUrl = baseUrl;
  }
  
  // インデックスファイルを読み込む
  async loadIndex(): Promise<void> {
    if (this.index) return;
    
    const indexUrl = `${this.baseUrl}/prefecture-index.json`;
    const response = await fetch(indexUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load index file: ${response.statusText}`);
    }
    
    this.index = await response.json();
  }
  
  // 精度レベルを設定
  setPrecision(precision: string): void {
    this.currentPrecision = precision;
  }
  
  // 都道府県のデータが利用可能かチェック
  async isPrefectureAvailable(prefectureCode: string): Promise<boolean> {
    await this.loadIndex();
    return this.index?.prefectures[prefectureCode] !== undefined;
  }
  
  // 都道府県の市区町村データを読み込む
  async loadMunicipalitiesForPrefecture(prefectureCode: string): Promise<GeoJSONFeature[]> {
    await this.loadIndex();
    
    // キャッシュキー
    const cacheKey = `${prefectureCode}-${this.currentPrecision}`;
    
    // キャッシュをチェック
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    
    // インデックスから情報を取得
    const prefInfo = this.index?.prefectures[prefectureCode];
    if (!prefInfo) {
      throw new Error(`Prefecture ${prefectureCode} not found in index`);
    }
    
    const fileInfo = prefInfo.files[this.currentPrecision];
    if (!fileInfo) {
      throw new Error(`Precision level ${this.currentPrecision} not available for prefecture ${prefectureCode}`);
    }
    
    // データファイルを読み込む
    const dataUrl = `${this.baseUrl}/${fileInfo.path}`;
    const response = await fetch(dataUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load municipality data: ${response.statusText}`);
    }
    
    const geoJson = await response.json();
    const features = geoJson.features as GeoJSONFeature[];
    
    // キャッシュに保存
    this.cache[cacheKey] = features;
    
    return features;
  }
  
  // 複数の都道府県のデータを並列で読み込む
  async loadMunicipalitiesForPrefectures(prefectureCodes: string[]): Promise<GeoJSONFeature[]> {
    const promises = prefectureCodes.map(code => 
      this.loadMunicipalitiesForPrefecture(code)
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  // キャッシュをクリア
  clearCache(prefectureCode?: string): void {
    if (prefectureCode) {
      // 特定の都道府県のキャッシュをクリア
      Object.keys(this.cache).forEach(key => {
        if (key.startsWith(prefectureCode)) {
          delete this.cache[key];
        }
      });
    } else {
      // 全キャッシュをクリア
      this.cache = {};
    }
  }
  
  // 現在のキャッシュサイズを取得（デバッグ用）
  getCacheInfo(): { count: number; prefectures: string[] } {
    const prefectures = new Set<string>();
    Object.keys(this.cache).forEach(key => {
      const [prefCode] = key.split('-');
      prefectures.add(prefCode);
    });
    
    return {
      count: Object.keys(this.cache).length,
      prefectures: Array.from(prefectures)
    };
  }
  
  // データサイズ情報を取得
  async getDataSizeInfo(prefectureCode: string): Promise<{
    name: string;
    sizes: { [precision: string]: number };
  } | null> {
    await this.loadIndex();
    
    const prefInfo = this.index?.prefectures[prefectureCode];
    if (!prefInfo) return null;
    
    const sizes: { [precision: string]: number } = {};
    Object.entries(prefInfo.files).forEach(([precision, info]) => {
      sizes[precision] = info.size;
    });
    
    return {
      name: prefInfo.name,
      sizes
    };
  }
}