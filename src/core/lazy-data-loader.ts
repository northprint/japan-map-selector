// 遅延ローディング対応のデータローダー

import { Prefecture, Municipality } from '../types';
import { loadPrefectureData, loadMunicipalityData } from './data-loader';

export interface LazyDataLoaderOptions {
  prefectureDataUrl: string;
  municipalityDataUrl?: string;
  preloadMunicipalities?: boolean; // 事前読み込みするかどうか
  onMunicipalityLoadStart?: () => void;
  onMunicipalityLoadEnd?: () => void;
}

export class LazyDataLoader {
  private prefectures: Prefecture[] = [];
  private municipalities: Municipality[] = [];
  private municipalityDataUrl?: string;
  private municipalitiesLoaded = false;
  private municipalitiesLoading = false;
  private municipalityLoadPromise?: Promise<Municipality[]>;
  private options: LazyDataLoaderOptions;

  constructor(options: LazyDataLoaderOptions) {
    this.options = options;
    this.municipalityDataUrl = options.municipalityDataUrl;
  }

  // 都道府県データの読み込み（初回のみ）
  async loadPrefectures(): Promise<Prefecture[]> {
    if (this.prefectures.length === 0) {
      this.prefectures = await loadPrefectureData(this.options.prefectureDataUrl);
    }
    return this.prefectures;
  }

  // 市区町村データの読み込み（遅延）
  async loadMunicipalities(): Promise<Municipality[]> {
    // 既に読み込み済み
    if (this.municipalitiesLoaded) {
      return this.municipalities;
    }

    // 読み込み中の場合は、既存のPromiseを返す
    if (this.municipalitiesLoading && this.municipalityLoadPromise) {
      return this.municipalityLoadPromise;
    }

    // URLが設定されていない場合
    if (!this.municipalityDataUrl) {
      console.warn('Municipality data URL is not set');
      return [];
    }

    // 読み込み開始
    this.municipalitiesLoading = true;
    this.options.onMunicipalityLoadStart?.();

    this.municipalityLoadPromise = loadMunicipalityData(this.municipalityDataUrl)
      .then(data => {
        this.municipalities = data;
        this.municipalitiesLoaded = true;
        this.municipalitiesLoading = false;
        this.options.onMunicipalityLoadEnd?.();
        return data;
      })
      .catch(error => {
        this.municipalitiesLoading = false;
        this.options.onMunicipalityLoadEnd?.();
        throw error;
      });

    return this.municipalityLoadPromise;
  }

  // 事前読み込み（オプション）
  async preloadMunicipalities(): Promise<void> {
    if (this.options.preloadMunicipalities && !this.municipalitiesLoaded) {
      await this.loadMunicipalities();
    }
  }

  getPrefectures(): Prefecture[] {
    return this.prefectures;
  }

  getMunicipalities(): Municipality[] {
    return this.municipalities;
  }

  isMunicipalitiesLoaded(): boolean {
    return this.municipalitiesLoaded;
  }

  isMunicipalitiesLoading(): boolean {
    return this.municipalitiesLoading;
  }
}

// 都道府県ごとに市区町村データを分割して読み込む場合の実装
export class SplitDataLoader {
  private prefectures: Prefecture[] = [];
  private municipalityCache: Map<string, Municipality[]> = new Map();
  private loadingCache: Map<string, Promise<Municipality[]>> = new Map();
  private baseUrl: string;

  constructor(private prefectureDataUrl: string, baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async loadPrefectures(): Promise<Prefecture[]> {
    if (this.prefectures.length === 0) {
      this.prefectures = await loadPrefectureData(this.prefectureDataUrl);
    }
    return this.prefectures;
  }

  // 特定の都道府県の市区町村データのみ読み込み
  async loadMunicipalitiesForPrefecture(prefectureCode: string): Promise<Municipality[]> {
    // キャッシュ確認
    if (this.municipalityCache.has(prefectureCode)) {
      return this.municipalityCache.get(prefectureCode)!;
    }

    // 読み込み中の場合
    if (this.loadingCache.has(prefectureCode)) {
      return this.loadingCache.get(prefectureCode)!;
    }

    // 新規読み込み
    const url = `${this.baseUrl}/municipalities-${prefectureCode}.geojson`;
    const loadPromise = fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load municipalities for prefecture ${prefectureCode}`);
        }
        return response.json();
      })
      .then(data => {
        const municipalities = data.features.map((feature: any) => ({
          code: feature.properties.code,
          name: feature.properties.name,
          prefectureCode: feature.properties.prefectureCode,
          geometry: feature.geometry,
          bounds: feature.properties.bounds || this.calculateBounds(feature.geometry)
        }));
        
        this.municipalityCache.set(prefectureCode, municipalities);
        this.loadingCache.delete(prefectureCode);
        return municipalities;
      })
      .catch(error => {
        this.loadingCache.delete(prefectureCode);
        throw error;
      });

    this.loadingCache.set(prefectureCode, loadPromise);
    return loadPromise;
  }

  private calculateBounds(geometry: any): [[number, number], [number, number]] {
    // 簡易的な境界計算（実際の実装では全座標を確認）
    return [[0, 0], [0, 0]];
  }

  getPrefectures(): Prefecture[] {
    return this.prefectures;
  }

  getMunicipalitiesForPrefecture(prefectureCode: string): Municipality[] {
    return this.municipalityCache.get(prefectureCode) || [];
  }

  clearCache(): void {
    this.municipalityCache.clear();
    this.loadingCache.clear();
  }
}