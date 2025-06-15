// フレームワーク非依存のコアロジック

import {
  JapanMapSelectorProps,
  MapState,
  Prefecture,
  Municipality
} from '../types';
import {
  loadPrefectureData,
  loadMunicipalityData,
  filterMunicipalitiesByPrefecture
} from './data-loader';
import {
  geometryToPath,
  calculateViewBox,
  getDefaultProjection,
  ProjectionConfig
} from './map-renderer';
import { isTokyoIsland } from './tokyo-islands';

export class JapanMapSelector {
  private prefectures: Prefecture[] = [];
  private municipalities: Municipality[] = [];
  private state: MapState;
  private listeners: Map<string, Function[]> = new Map();
  private props: JapanMapSelectorProps;
  private currentProjection: ProjectionConfig;

  constructor(props: JapanMapSelectorProps = {}) {
    this.props = {
      width: 800,
      height: 600,
      prefectureColor: '#e0e0e0',
      prefectureHoverColor: '#c0c0c0',
      municipalityColor: '#f0f0f0',
      municipalityHoverColor: '#d0d0d0',
      ...props
    };

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
    this.prefectures = await loadPrefectureData(prefectureDataUrl);
    this.municipalities = await loadMunicipalityData(municipalityDataUrl);
    
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
    const padding = 40; // パディングを少し増やして端が切れないようにする
    const scaleX = (this.props.width! - 2 * padding) / width;
    const scaleY = (this.props.height! - 2 * padding) / height;
    const scale = Math.min(scaleX, scaleY) * 1.1; // スケールを10%大きくする（20%は大きすぎたので調整）
    
    return {
      scale,
      translateX: this.props.width! / 2,
      translateY: this.props.height! / 2,
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
  private emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // 都道府県の選択
  selectPrefecture(prefectureCode: string) {
    const prefecture = this.prefectures.find(p => p.code === prefectureCode);
    if (prefecture) {
      this.state.selectedPrefecture = prefecture;
      this.state.showTokyoIslands = false; // 離島表示をリセット
      
      // 東京都の場合は本土の境界を使用
      let bounds = prefecture.bounds;
      if (prefectureCode === '13') {
        // 東京都本土の境界（23区周辺）
        bounds = [[138.5, 35.3], [140.0, 36.0]];
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
    
    return allMunicipalities;
  }

  // 都道府県のSVGパスを生成
  getPrefecturePath(prefecture: Prefecture): string {
    // 全国表示の時
    if (!this.state.selectedPrefecture) {
      let geometry = prefecture.feature.geometry;
      
      // 離島を含む都道府県の本土部分のみを表示
      switch (prefecture.name) {
        case '東京都':
          // 東京都の離島を除外（特定の離島のみを除外する）
          geometry = this.filterTokyoMainlandOnly(geometry);
          break;
        case '鹿児島県':
          // 鹿児島県の離島を除外（主に南方の離島）
          geometry = this.filterGeometryByLatitude(geometry, 30.0, 'north');
          break;
        case '長崎県':
          // 長崎県の離島を簡易的にフィルタリング（五島列島などを除外）
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
          const okinawaProjection: ProjectionConfig = {
            scale: this.currentProjection.scale * 2, // 拡大
            translateX: 100, // 左上に配置（左に寄せる）
            translateY: 80,  // 上に寄せる
            center: [127.7, 26.3] // 沖縄の中心
          };
          return geometryToPath(geometry, okinawaProjection);
      }
      
      return geometryToPath(geometry, this.currentProjection);
    }
    
    return geometryToPath(prefecture.feature.geometry, this.currentProjection);
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
      
      console.log(`Tokyo: Filtered to ${filteredCoordinates.length} polygons`);
      
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
      
      console.log(`Filtered ${originalCount} to ${filteredCoordinates.length} polygons (threshold: ${threshold})`);
      
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
  
  // 沖縄県の枠を取得
  getOkinawaFrame(): { x: number; y: number; width: number; height: number } | null {
    const okinawa = this.prefectures.find(p => p.name === '沖縄県');
    if (!okinawa) return null;
    
    // 沖縄県の境界から枠のサイズを計算
    const [[west, south], [east, north]] = okinawa.bounds;
    const okinawaProjection: ProjectionConfig = {
      scale: this.currentProjection.scale * 2,
      translateX: 100, // 左に寄せる
      translateY: 80,  // 上に寄せる
      center: [127.7, 26.3]
    };
    
    // 境界の4隅を投影
    const topLeft = this.projectPoint(west, north, okinawaProjection);
    const bottomRight = this.projectPoint(east, south, okinawaProjection);
    
    const padding = 20; // パディングを増やす
    const margin = 10; // 枠の外側のマージン
    return {
      x: topLeft[0] - padding - margin,
      y: topLeft[1] - padding - margin - 15, // ラベル用のスペースを追加
      width: bottomRight[0] - topLeft[0] + 2 * padding,
      height: bottomRight[1] - topLeft[1] + 2 * padding + 15 // ラベル用のスペースを追加
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
    // 選択された都道府県のビューで市区町村を表示
    return geometryToPath(municipality.feature.geometry, this.currentProjection);
  }

  // 都道府県のホバー
  hoverPrefecture(prefectureCode: string | null) {
    const previousHovered = this.state.hoveredPrefecture;
    
    if (prefectureCode) {
      const prefecture = this.prefectures.find(p => p.code === prefectureCode);
      this.state.hoveredPrefecture = prefecture || null;
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
        // 離島エリアの境界を計算
        const islandBounds: [[number, number], [number, number]] = [[138.0, 24.0], [143.0, 35.0]];
        const { viewBox, projection } = calculateViewBox(islandBounds);
        this.state.viewBox = viewBox;
        this.currentProjection = projection;
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
}