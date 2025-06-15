// 地図レンダリング用のユーティリティ関数

import { GeoJSONFeature } from '../types';

// SVGパス生成用の投影設定
export interface ProjectionConfig {
  scale: number;
  translateX: number;
  translateY: number;
  center: [number, number];
}

// メルカトル投影の簡易実装
export function mercatorProjection(
  longitude: number, 
  latitude: number, 
  config: ProjectionConfig
): [number, number] {
  // 数値のバリデーション
  if (!isFinite(longitude) || !isFinite(latitude)) {
    console.warn('Invalid coordinates for projection:', { longitude, latitude });
    return [0, 0];
  }
  
  const x = (longitude - config.center[0]) * config.scale + config.translateX;
  const y = (-latitude + config.center[1]) * config.scale + config.translateY;
  
  // 結果のバリデーション
  if (!isFinite(x) || !isFinite(y)) {
    console.warn('Projection resulted in non-finite values:', { x, y, longitude, latitude, config });
    return [0, 0];
  }
  
  return [x, y];
}

// GeoJSONジオメトリからSVGパスデータを生成
export function geometryToPath(
  geometry: GeoJSONFeature['geometry'],
  projection: ProjectionConfig,
  transform?: { scale: number; translateX: number; translateY: number }
): string {
  const pathData: string[] = [];

  const processRing = (ring: number[][]) => {
    // 空のリングをスキップ
    if (!ring || ring.length === 0) {
      return;
    }
    
    let validCoords = 0;
    ring.forEach((coord, index) => {
      // 座標が正しい形式か確認
      if (!Array.isArray(coord) || coord.length < 2) {
        console.warn('Invalid coordinate:', coord);
        return;
      }
      const [lng, lat] = coord;
      // 数値であることを確認
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.warn('Non-numeric coordinate:', coord);
        return;
      }
      let [x, y] = mercatorProjection(lng, lat, projection);
      
      // 追加の変換を適用（沖縄県用など）
      if (transform) {
        x = x * transform.scale + transform.translateX;
        y = y * transform.scale + transform.translateY;
      }
      
      if (validCoords === 0) {
        pathData.push(`M${x},${y}`);
      } else {
        pathData.push(`L${x},${y}`);
      }
      validCoords++;
    });
    
    // 有効な座標がある場合のみパスを閉じる
    if (validCoords > 0) {
      pathData.push('Z');
    }
  };

  const processPolygon = (polygon: number[][][]) => {
    polygon.forEach(ring => processRing(ring));
  };

  if (geometry.type === 'Polygon') {
    processPolygon(geometry.coordinates as number[][][]);
  } else if (geometry.type === 'MultiPolygon') {
    (geometry.coordinates as number[][][][]).forEach(polygon => {
      processPolygon(polygon);
    });
  }

  return pathData.join(' ');
}

// 境界ボックスから適切なビューボックスを計算
export function calculateViewBox(
  bounds: [[number, number], [number, number]],
  padding: number = 20
): { viewBox: string; projection: ProjectionConfig } {
  const [[west, south], [east, north]] = bounds;
  const centerLng = (west + east) / 2;
  const centerLat = (south + north) / 2;
  
  const width = east - west;
  const height = north - south;
  
  // アスペクト比を考慮したスケール計算
  const scale = Math.min(
    (800 - 2 * padding) / width,
    (600 - 2 * padding) / height
  );
  
  const projection: ProjectionConfig = {
    scale,
    translateX: 400,
    translateY: 300,
    center: [centerLng, centerLat]
  };
  
  return {
    viewBox: `0 0 800 600`,
    projection
  };
}

// 日本全体の標準的な境界ボックス
export const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [122.0, 24.0],  // 南西（沖縄）
  [146.0, 46.0]   // 北東（北海道）
];

// デフォルトの投影設定（日本全体用）
export function getDefaultProjection(): ProjectionConfig {
  return {
    scale: 30,  // スケールを小さくして全体が入るように
    translateX: 400,
    translateY: 300,
    center: [138.0, 38.0]  // 中心を北に移動
  };
}