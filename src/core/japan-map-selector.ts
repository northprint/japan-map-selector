// フレームワーク非依存のコアロジック

import {
  JapanMapSelectorProps,
  MapState,
  Prefecture,
  Municipality,
  ColorTheme
} from '../types';
import {
  loadPrefectureData,
  loadMunicipalityData,
  filterMunicipalitiesByPrefecture,
  initializeDynamicLoader,
  loadMunicipalitiesForPrefecture,
  setDynamicLoaderPrecision,
  clearDynamicLoaderCache
} from './data-loader';
import {
  geometryToPath,
  calculateViewBox,
  getDefaultProjection,
  ProjectionConfig
} from './map-renderer';
import { isTokyoIsland } from './tokyo-islands';
import { getTheme, applyColorOverrides, getPrefectureFillColor, getMunicipalityFillColor, getMunicipalityHoverFillColor } from './themes';
import { GridDeformer, HexagonalGridDeformer } from './grid-deformer';

export class JapanMapSelector {
  private prefectures: Prefecture[] = [];
  private municipalities: Municipality[] = [];
  private municipalitiesCache: Map<string, Municipality[]> = new Map();
  private state: MapState;
  private listeners: Map<string, Function[]> = new Map();
  private props: JapanMapSelectorProps;
  private currentProjection: ProjectionConfig;
  private theme: ColorTheme;
  private currentThemeName: string = 'default';
  private deformer: GridDeformer | null = null;
  private deformMode: 'none' | 'grid' | 'hexagon' = 'none';
  private isDynamicLoadingEnabled: boolean = false;

  constructor(props: JapanMapSelectorProps = {}) {
    this.props = {
      width: 800,
      height: 600,
      ...props
    };
    
    // テーマの設定
    this.theme = applyColorOverrides(
      getTheme(props.theme),
      props
    );
    if (typeof props.theme === 'string') {
      this.currentThemeName = props.theme;
    }

    this.currentProjection = getDefaultProjection();
    this.state = {
      selectedPrefecture: null,
      hoveredPrefecture: null,
      hoveredMunicipality: null,
      viewBox: '0 0 800 600',
      scale: 1,
      translateX: 0,
      translateY: 0,
      showTokyoIslands: false
    };
  }

  // データの初期化
  async initialize(prefectureDataUrl: string, municipalityDataUrl: string) {
    // 動的読み込みが有効な場合
    if (this.props.enableDynamicLoading) {
      this.isDynamicLoadingEnabled = true;
      // 動的ローダーを初期化
      const loader = initializeDynamicLoader(this.props.dynamicDataBaseUrl);
      // 精度レベルを設定
      if (this.props.simplificationLevel) {
        setDynamicLoaderPrecision(this.props.simplificationLevel);
      }
      // 都道府県データのみ読み込む
      this.prefectures = await loadPrefectureData(prefectureDataUrl);
      // 市区町村データは空の配列に
      this.municipalities = [];
    } else {
      // 従来の一括読み込み
      this.prefectures = await loadPrefectureData(prefectureDataUrl);
      this.municipalities = await loadMunicipalityData(municipalityDataUrl);
    }
    
    // 全都道府県の境界から最適な投影を計算
    this.currentProjection = this.calculateOptimalProjection();
    
    this.emit('initialized');
  }
  
  // 全都道府県が収まる最適な投影を計算
  private calculateOptimalProjection(): ProjectionConfig {
    if (this.prefectures.length === 0) {
      return getDefaultProjection();
    }
    
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    // 沖縄県と離島を除外して本州の境界を計算
    this.prefectures.forEach(pref => {
      if (pref.name !== '沖縄県') {
        const [[west, south], [east, north]] = pref.bounds;
        
        // 東京都の離島（小笠原諸島など）を除外
        if (pref.name === '東京都') {
          // 本州部分のみ（東経142度以西）
          minLng = Math.min(minLng, west);
          maxLng = Math.max(maxLng, Math.min(east, 142.0));
          minLat = Math.min(minLat, Math.max(south, 34.5)); // 伊豆諸島の一部も除外
          maxLat = Math.max(maxLat, north);
        } else if (pref.name === '北海道') {
          // 北海道の場合、北方領土を除外した実際の範囲を使用
          // 北海道本土は概ね東経139.5度〜145.5度の範囲
          minLng = Math.min(minLng, Math.max(west, 139.5)); // 西側の実際の境界
          maxLng = Math.max(maxLng, Math.min(east, 145.5)); // 東経145.5度以西（北方領土除外）
          minLat = Math.min(minLat, south);
          maxLat = Math.max(maxLat, north);
        } else {
          minLng = Math.min(minLng, west);
          maxLng = Math.max(maxLng, east);
          minLat = Math.min(minLat, south);
          maxLat = Math.max(maxLat, north);
        }
      }
    });
    
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2 + 2.0; // 中心を北に移動して地図全体を下に表示
    const width = maxLng - minLng;
    const height = maxLat - minLat;
    
    // パディングを考慮してスケールを計算
    const padding = 40; // パディングを調整
    const scaleX = (this.props.width! - 2 * padding) / width;
    const scaleY = (this.props.height! - 2 * padding) / height;
    const scale = Math.min(scaleX, scaleY) * 1.0; // 通常のスケール
    
    return {
      scale,
      translateX: this.props.width! / 2, // 中央に配置
      translateY: this.props.height! / 2 - 20, // 少し上にずらして沖縄枠のスペースを作る
      center: [centerLng, centerLat]
    };
  }

  // イベントリスナーの登録
  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  // イベントリスナーの削除
  off(event: string, listener: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // イベントの発火
  emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // 都道府県が選択可能かチェック
  isPrefectureSelectable(prefectureCode: string): boolean {
    if (!this.props.selectablePrefectures || this.props.selectablePrefectures.length === 0) {
      return true; // 未指定の場合は全て選択可能
    }
    return this.props.selectablePrefectures.includes(prefectureCode);
  }
  
  // 都道府県の選択
  async selectPrefecture(prefectureCode: string) {
    // 選択可能かチェック
    if (!this.isPrefectureSelectable(prefectureCode)) {
      return;
    }
    
    const prefecture = this.prefectures.find(p => p.code === prefectureCode);
    if (prefecture) {
      this.state.selectedPrefecture = prefecture;
      this.state.showTokyoIslands = false; // 離島表示をリセット
      
      // 動的読み込みが有効な場合
      if (this.isDynamicLoadingEnabled) {
        // 都道府県を切り替えた時点で市区町村データをクリア
        this.municipalities = [];
        
        // キャッシュをチェック
        if (!this.municipalitiesCache.has(prefectureCode)) {
          // 読み込み開始を通知
          if (this.props.onMunicipalityLoadStart) {
            this.props.onMunicipalityLoadStart(prefecture);
          }
          
          try {
            // 市区町村データを動的に読み込む
            const municipalitiesForPrefecture = await loadMunicipalitiesForPrefecture(prefectureCode);
            this.municipalitiesCache.set(prefectureCode, municipalitiesForPrefecture);
            
            // キャッシュから市区町村データを設定（読み込み終了通知の前に設定）
            this.municipalities = municipalitiesForPrefecture;
            
            // 読み込み終了を通知（データ設定後）
            if (this.props.onMunicipalityLoadEnd) {
              this.props.onMunicipalityLoadEnd(prefecture);
            }
          } catch (error) {
            console.error(`Failed to load municipalities for prefecture ${prefectureCode}:`, error);
            // エラー時は空の配列を設定
            this.municipalities = [];
            // 読み込みエラー時も終了を通知
            if (this.props.onMunicipalityLoadEnd) {
              this.props.onMunicipalityLoadEnd(prefecture);
            }
            return;
          }
        } else {
          // キャッシュから市区町村データを設定
          this.municipalities = this.municipalitiesCache.get(prefectureCode) || [];
        }
      }
      
      // 東京都・北海道の場合は本土の境界を使用
      let bounds = prefecture.bounds;
      if (prefectureCode === '13') {
        // 東京都本土の境界（23区周辺）
        bounds = [[138.5, 35.3], [140.0, 36.0]];
      } else if (prefectureCode === '01') {
        // 北海道本土の境界（北方領土を除外）
        // 北海道の実際の市区町村データから正確な境界を計算
        const hokkaidoMunicipalities = this.municipalities.filter(m => m.prefectureCode === '01');
        let actualMinLng = Infinity, actualMaxLng = -Infinity;
        let actualMinLat = Infinity, actualMaxLat = -Infinity;
        
        hokkaidoMunicipalities.forEach(municipality => {
          const geometry = municipality.feature.geometry;
          const updateBounds = (coord: number[]) => {
            const [lng, lat] = coord;
            // 北方領土の座標を除外
            if (lng < 145.5) {
              actualMinLng = Math.min(actualMinLng, lng);
              actualMaxLng = Math.max(actualMaxLng, lng);
              actualMinLat = Math.min(actualMinLat, lat);
              actualMaxLat = Math.max(actualMaxLat, lat);
            }
          };
          
          if (geometry.type === 'Polygon') {
            (geometry.coordinates as number[][][]).forEach(ring => 
              ring.forEach(updateBounds)
            );
          } else if (geometry.type === 'MultiPolygon') {
            (geometry.coordinates as number[][][][]).forEach(polygon =>
              polygon.forEach(ring => ring.forEach(updateBounds))
            );
          }
        });
        
        // 計算された実際の境界を使用
        if (actualMinLng !== Infinity) {
          bounds = [[actualMinLng, actualMinLat], [actualMaxLng, actualMaxLat]];
        }
      }
      
      // ビューボックスを都道府県に合わせて調整
      const { viewBox, projection } = calculateViewBox(bounds);
      this.state.viewBox = viewBox;
      this.currentProjection = projection;
      
      this.emit('prefectureSelected', prefecture);
      this.emit('stateChanged', this.state);
      
      if (this.props.onPrefectureSelect) {
        this.props.onPrefectureSelect(prefecture);
      }
    }
  }

  // 市区町村の選択
  selectMunicipality(municipalityCode: string) {
    const municipality = this.municipalities.find(m => m.code === municipalityCode);
    if (municipality) {
      this.emit('municipalitySelected', municipality);
      
      if (this.props.onMunicipalitySelect) {
        this.props.onMunicipalitySelect(municipality);
      }
    }
  }

  // 都道府県一覧の取得
  getPrefectures(): Prefecture[] {
    return this.prefectures;
  }

  // 選択された都道府県の市区町村を取得
  getSelectedMunicipalities(): Municipality[] {
    if (!this.state.selectedPrefecture) {
      return [];
    }
    
    // 動的読み込みが有効な場合は、現在の municipalities 配列を使用
    if (this.isDynamicLoadingEnabled) {
      return this.municipalities;
    }
    
    const allMunicipalities = filterMunicipalitiesByPrefecture(
      this.municipalities,
      this.state.selectedPrefecture.code
    );
    
    // 東京都の場合、離島表示の設定に応じてフィルタリング
    if (this.state.selectedPrefecture.code === '13') {
      return allMunicipalities.filter(m => {
        const isIsland = isTokyoIsland(m.name);
        return this.state.showTokyoIslands ? isIsland : !isIsland;
      });
    }
    
    // 北海道の場合、北方領土の市区町村を除外
    if (this.state.selectedPrefecture.code === '01') {
      return allMunicipalities.filter(m => {
        // 市区町村の座標から北方領土かどうか判定
        if (m.feature.geometry.type === 'MultiPolygon') {
          const coordinates = m.feature.geometry.coordinates as number[][][][];
          // 最初のポリゴンの中心点をチェック
          if (coordinates.length > 0 && coordinates[0].length > 0) {
            const ring = coordinates[0][0];
            let sumLng = 0, sumLat = 0;
            ring.forEach(coord => {
              sumLng += coord[0];
              sumLat += coord[1];
            });
            const centerLng = sumLng / ring.length;
            const centerLat = sumLat / ring.length;
            // 北方領土の市区町村を除外
            return !(centerLat > 43.5 && centerLng > 145.5);
          }
        } else if (m.feature.geometry.type === 'Polygon') {
          const coordinates = m.feature.geometry.coordinates as number[][][];
          if (coordinates.length > 0) {
            const ring = coordinates[0];
            let sumLng = 0, sumLat = 0;
            ring.forEach(coord => {
              sumLng += coord[0];
              sumLat += coord[1];
            });
            const centerLng = sumLng / ring.length;
            const centerLat = sumLat / ring.length;
            // 北方領土の市区町村を除外
            return !(centerLat > 43.5 && centerLng > 145.5);
          }
        }
        return true;
      });
    }
    
    return allMunicipalities;
  }

  // 都道府県のSVGパスを生成
  getPrefecturePath(prefecture: Prefecture): string {
    // ディフォルメを適用
    const deformed = this.getDeformedPrefecture(prefecture);
    
    // 全国表示の時
    if (!this.state.selectedPrefecture) {
      let geometry = deformed.feature.geometry;
      
      // 離島を含む都道府県の本土部分のみを表示
      switch (prefecture.name) {
        case '北海道':
          // 北方領土を除外
          geometry = this.filterHokkaidoMainland(geometry);
          break;
        case '東京都':
          // 東京都の離島を除外（特定の離島のみを除外する）
          geometry = this.filterTokyoMainlandOnly(geometry);
          break;
        case '鹿児島県':
          // 鹿児島県の離島を除外（主に南方の離島）
          geometry = this.filterGeometryByLatitude(geometry, 30.0, 'north');
          break;
        case '長崎県':
          // 長崎県の離島を簡易的にフィルタリング（五島列島などを除妖）
          geometry = this.filterGeometryByBounds(geometry, [[129.0, 32.5], [130.0, 34.0]]);
          break;
        // case '新潟県':
        //   // 佐渡島を除外 - 一旦コメントアウト
        //   geometry = this.filterGeometryByLongitude(geometry, 138.3, 'east');
        //   break;
        case '島根県':
          // 隠岐諸島を除外
          geometry = this.filterGeometryByLongitude(geometry, 133.0, 'west');
          break;
        case '沖縄県':
          // 沖縄県は特別な投影設定で表示
          // 沖縄県の実際の境界を使用して中心を計算
          const [[west, south], [east, north]] = prefecture.bounds;
          const okinawaCenterLng = (west + east) / 2;
          const okinawaCenterLat = (south + north) / 2;
          
          const okinawaProjection: ProjectionConfig = {
            scale: this.currentProjection.scale * 0.7, // 適度に小さくして枠内に収める
            translateX: 210, // 枠の中央に配置（枠x:120 + 幅180/2）
            translateY: 120,  // 枠の中央に配置（枠y:50 + 高さ140/2）
            center: [okinawaCenterLng, okinawaCenterLat] // 動的に計算した中心
          };
          return geometryToPath(geometry, okinawaProjection);
      }
      
      return geometryToPath(geometry, this.currentProjection);
    }
    
    return geometryToPath(deformed.feature.geometry, this.currentProjection);
  }
  
  // 東京都の本土のみを残すフィルタリング
  private filterTokyoMainlandOnly(
    geometry: Prefecture['feature']['geometry']
  ): Prefecture['feature']['geometry'] {
    if (geometry.type === 'MultiPolygon') {
      const filteredCoordinates = (geometry.coordinates as number[][][][]).filter(polygon => {
        // ポリゴンの中心点を計算
        const ring = polygon[0];
        let sumLng = 0, sumLat = 0;
        ring.forEach((coord: number[]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        const centerLng = sumLng / ring.length;
        const centerLat = sumLat / ring.length;
        
        // 離島を除外する条件
        // 伊豆諸島（南方）: 緯度34度以南
        // 小笠原諸島（東方）: 経度141度以東
        const isMainland = !(
          (centerLat < 34.0) || // 伊豆諸島など
          (centerLng > 141.0)    // 小笠原諸島
        );
        
        return isMainland;
      });
      
      
      return {
        type: 'MultiPolygon',
        coordinates: filteredCoordinates
      };
    }
    return geometry;
  }
  
  // 経度でジオメトリをフィルタリング
  private filterGeometryByLongitude(
    geometry: Prefecture['feature']['geometry'], 
    threshold: number, 
    direction: 'east' | 'west'
  ): Prefecture['feature']['geometry'] {
    if (geometry.type === 'MultiPolygon') {
      const originalCount = (geometry.coordinates as number[][][][]).length;
      const filteredCoordinates = (geometry.coordinates as number[][][][]).filter(polygon => {
        // ポリゴンの全ての点をチェックして、すべてが閾値の条件を満たすか確認
        const ring = polygon[0];
        const allPointsMatch = ring.every((coord: number[]) => {
          return direction === 'west' ? coord[0] < threshold : coord[0] > threshold;
        });
        return allPointsMatch;
      });
      
      
      return {
        type: 'MultiPolygon',
        coordinates: filteredCoordinates
      };
    }
    return geometry;
  }
  
  // 緯度でジオメトリをフィルタリング
  private filterGeometryByLatitude(
    geometry: Prefecture['feature']['geometry'], 
    threshold: number, 
    direction: 'north' | 'south'
  ): Prefecture['feature']['geometry'] {
    if (geometry.type === 'MultiPolygon') {
      const filteredCoordinates = (geometry.coordinates as number[][][][]).filter(polygon => {
        const ring = polygon[0];
        const allPointsMatch = ring.every((coord: number[]) => {
          return direction === 'north' ? coord[1] > threshold : coord[1] < threshold;
        });
        return allPointsMatch;
      });
      
      return {
        type: 'MultiPolygon',
        coordinates: filteredCoordinates
      };
    }
    return geometry;
  }
  
  // 境界ボックスでジオメトリをフィルタリング
  private filterGeometryByBounds(
    geometry: Prefecture['feature']['geometry'],
    bounds: [[number, number], [number, number]]
  ): Prefecture['feature']['geometry'] {
    if (geometry.type === 'MultiPolygon') {
      const [[west, south], [east, north]] = bounds;
      const filteredCoordinates = (geometry.coordinates as number[][][][]).filter(polygon => {
        const ring = polygon[0];
        const allPointsMatch = ring.every((coord: number[]) => {
          return coord[0] >= west && coord[0] <= east &&
                 coord[1] >= south && coord[1] <= north;
        });
        return allPointsMatch;
      });
      
      return {
        type: 'MultiPolygon',
        coordinates: filteredCoordinates
      };
    }
    return geometry;
  }
  
  // 北海道の本土のみを残すフィルタリング（北方領土を除外）
  private filterHokkaidoMainland(
    geometry: Prefecture['feature']['geometry']
  ): Prefecture['feature']['geometry'] {
    if (geometry.type === 'MultiPolygon') {
      const filteredCoordinates = (geometry.coordinates as number[][][][]).filter(polygon => {
        // ポリゴンの中心点を計算
        const ring = polygon[0];
        let sumLng = 0, sumLat = 0;
        ring.forEach((coord: number[]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        const centerLng = sumLng / ring.length;
        const centerLat = sumLat / ring.length;
        
        // 北方領土を除外する条件
        // 緯度43.5度以北かつ東経145.5度以東の領域を除外
        const isMainland = !(centerLat > 43.5 && centerLng > 145.5);
        
        return isMainland;
      });
      
      
      return {
        type: 'MultiPolygon',
        coordinates: filteredCoordinates
      };
    }
    return geometry;
  }
  
  // 沖縄県の枠を取得
  getOkinawaFrame(): { x: number; y: number; width: number; height: number } | null {
    const okinawa = this.prefectures.find(p => p.name === '沖縄県');
    if (!okinawa) return null;
    
    // 固定サイズの枠を返す
    return {
      x: 120,  // 九州の左端と同じ位置に配置
      y: 50,  // 北海道の上端と同じくらいの高さに配置
      width: 180,  // 幅を調整
      height: 140  // 高さを調整
    };
  }
  
  // 座標を投影
  private projectPoint(lng: number, lat: number, projection: ProjectionConfig): [number, number] {
    const x = (lng - projection.center[0]) * projection.scale + projection.translateX;
    const y = (-lat + projection.center[1]) * projection.scale + projection.translateY;
    return [x, y];
  }

  // 市区町村のSVGパスを生成
  getMunicipalityPath(municipality: Municipality): string {
    // ディフォルメを適用
    const deformed = this.getDeformedMunicipality(municipality);
    // 選択された都道府県のビューで市区町村を表示
    return geometryToPath(deformed.feature.geometry, this.currentProjection);
  }

  // 都道府県のホバー
  hoverPrefecture(prefectureCode: string | null) {
    const previousHovered = this.state.hoveredPrefecture;
    
    if (prefectureCode) {
      // 選択不可の場合はホバーしない
      if (!this.isPrefectureSelectable(prefectureCode)) {
        this.state.hoveredPrefecture = null;
      } else {
        const prefecture = this.prefectures.find(p => p.code === prefectureCode);
        this.state.hoveredPrefecture = prefecture || null;
      }
    } else {
      this.state.hoveredPrefecture = null;
    }
    
    // 状態が実際に変更された場合のみイベントを発火
    if (previousHovered?.code !== this.state.hoveredPrefecture?.code) {
      this.emit('stateChanged', this.state);
    }
  }

  // 市区町村のホバー
  hoverMunicipality(municipalityCode: string | null) {
    const previousHovered = this.state.hoveredMunicipality;
    
    if (municipalityCode) {
      const municipality = this.municipalities.find(m => m.code === municipalityCode);
      this.state.hoveredMunicipality = municipality || null;
    } else {
      this.state.hoveredMunicipality = null;
    }
    
    // 状態が実際に変更された場合のみイベントを発火
    if (previousHovered?.code !== this.state.hoveredMunicipality?.code) {
      this.emit('stateChanged', this.state);
    }
  }

  // 日本全体ビューに戻る
  resetView() {
    this.state.selectedPrefecture = null;
    this.state.viewBox = '0 0 800 600';
    this.state.showTokyoIslands = false;
    this.currentProjection = this.calculateOptimalProjection();
    this.emit('stateChanged', this.state);
  }
  
  // 東京都の離島表示を切り替え
  toggleTokyoIslands() {
    if (this.state.selectedPrefecture?.code === '13') {
      this.state.showTokyoIslands = !this.state.showTokyoIslands;
      
      // 離島表示の場合はビューを調整
      if (this.state.showTokyoIslands) {
        // 離島の市区町村から実際の境界を計算
        const islandMunicipalities = this.getSelectedMunicipalities();
        if (islandMunicipalities.length > 0) {
          let minLng = Infinity, maxLng = -Infinity;
          let minLat = Infinity, maxLat = -Infinity;
          
          islandMunicipalities.forEach(municipality => {
            const geometry = municipality.feature.geometry;
            const updateBounds = (coord: number[]) => {
              const [lng, lat] = coord;
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            };
            
            if (geometry.type === 'Polygon') {
              (geometry.coordinates as number[][][]).forEach(ring => 
                ring.forEach(updateBounds)
              );
            } else if (geometry.type === 'MultiPolygon') {
              (geometry.coordinates as number[][][][]).forEach(polygon =>
                polygon.forEach(ring => ring.forEach(updateBounds))
              );
            }
          });
          
          // パディングを追加
          const padding = 0.5;
          const islandBounds: [[number, number], [number, number]] = [
            [minLng - padding, minLat - padding], 
            [maxLng + padding, maxLat + padding]
          ];
          const { viewBox, projection } = calculateViewBox(islandBounds);
          this.state.viewBox = viewBox;
          this.currentProjection = projection;
        }
      } else {
        // 本土エリアに戻す
        const mainlandBounds: [[number, number], [number, number]] = [[138.5, 35.3], [140.0, 36.0]];
        const { viewBox, projection } = calculateViewBox(mainlandBounds);
        this.state.viewBox = viewBox;
        this.currentProjection = projection;
      }
      
      this.emit('stateChanged', this.state);
    }
  }

  // 現在の状態を取得
  getState(): MapState {
    return { ...this.state };
  }

  // プロパティを取得
  getProps(): JapanMapSelectorProps {
    return { ...this.props };
  }
  
  // 現在のテーマを取得
  getTheme(): ColorTheme {
    return { ...this.theme };
  }
  
  // テーマを変更
  setTheme(themeNameOrObject: ColorTheme | string) {
    this.theme = applyColorOverrides(
      getTheme(themeNameOrObject),
      this.props
    );
    // テーマ名を保存（カラフル/ランダムテーマ用）
    if (typeof themeNameOrObject === 'string') {
      this.currentThemeName = themeNameOrObject;
    }
    this.emit('themeChanged', this.theme);
    this.emit('stateChanged', this.state);
  }

  // ディフォルメモードの設定
  setDeformMode(mode: 'none' | 'grid' | 'hexagon', gridSize: number = 0.1) {
    this.deformMode = mode;
    
    if (mode === 'none') {
      this.deformer = null;
    } else if (mode === 'grid') {
      this.deformer = new GridDeformer({ gridSize, preserveTopology: true });
    } else if (mode === 'hexagon') {
      this.deformer = new HexagonalGridDeformer({ gridSize, preserveTopology: true });
    }
    
    this.emit('stateChanged', this.state);
  }

  // ディフォルメされた都道府県データを取得
  private getDeformedPrefecture(prefecture: Prefecture): Prefecture {
    if (!this.deformer) return prefecture;
    return this.deformer.deformPrefecture(prefecture);
  }

  // ディフォルメされた市区町村データを取得
  private getDeformedMunicipality(municipality: Municipality): Municipality {
    if (!this.deformer) return municipality;
    return this.deformer.deformMunicipality(municipality);
  }
  
  // 都道府県の塗りつぶし色を取得（テーマによって異なる）
  getPrefectureFillColor(prefecture: Prefecture): string {
    // 選択不可の場合
    if (!this.isPrefectureSelectable(prefecture.code)) {
      return this.props.disabledPrefectureFill || '#cccccc';
    }
    
    if (this.currentThemeName === 'colorful' || this.currentThemeName === 'random') {
      return getPrefectureFillColor(prefecture.code, this.currentThemeName);
    }
    return this.theme.prefectureFill;
  }
  
  // 都道府県の枠線色を取得
  getPrefectureStrokeColor(prefecture: Prefecture): string {
    // 選択不可の場合
    if (!this.isPrefectureSelectable(prefecture.code)) {
      return this.props.disabledPrefectureStroke || '#999999';
    }
    return this.theme.prefectureStroke;
  }
  
  // 市区町村の塗りつぶし色を取得（テーマによって異なる）
  getMunicipalityFillColor(municipality: Municipality): string {
    if (this.currentThemeName === 'colorful' || this.currentThemeName === 'random') {
      return getMunicipalityFillColor(municipality.code, municipality.prefectureCode, this.currentThemeName);
    }
    return this.theme.municipalityFill;
  }
  
  // 市区町村のホバー色を取得（テーマによって異なる）
  getMunicipalityHoverFillColor(municipality: Municipality): string {
    if (this.currentThemeName === 'colorful' || this.currentThemeName === 'random') {
      return getMunicipalityHoverFillColor(municipality.code, municipality.prefectureCode, this.currentThemeName);
    }
    return this.theme.municipalityHoverFill;
  }
}