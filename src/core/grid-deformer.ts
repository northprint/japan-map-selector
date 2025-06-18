// グリッドベースのディフォルメ処理

import { Prefecture, Municipality } from '../types';

export interface GridDeformerOptions {
  gridSize: number; // グリッドサイズ（度単位）
  preserveTopology: boolean; // トポロジーを保持するか
}

export class GridDeformer {
  protected gridSize: number;
  protected preserveTopology: boolean;

  constructor(options: GridDeformerOptions = { gridSize: 0.1, preserveTopology: true }) {
    this.gridSize = options.gridSize;
    this.preserveTopology = options.preserveTopology;
  }

  // 座標をグリッドにスナップ
  protected snapToGrid(coord: number[]): number[] {
    const [lng, lat] = coord;
    const snappedLng = Math.round(lng / this.gridSize) * this.gridSize;
    const snappedLat = Math.round(lat / this.gridSize) * this.gridSize;
    return [snappedLng, snappedLat];
  }

  // ポリゴンの面積を計算（簡易版）
  protected calculatePolygonArea(polygon: number[][]): number {
    let area = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
      area += polygon[i][0] * polygon[i + 1][1];
      area -= polygon[i + 1][0] * polygon[i][1];
    }
    return Math.abs(area / 2);
  }

  // ポリゴンの中心点を計算
  protected calculatePolygonCenter(polygon: number[][]): number[] {
    let sumX = 0, sumY = 0;
    const count = polygon.length - 1; // 最後の点は最初の点と同じなので除外
    for (let i = 0; i < count; i++) {
      sumX += polygon[i][0];
      sumY += polygon[i][1];
    }
    return [sumX / count, sumY / count];
  }

  // ポリゴンをディフォルメ
  protected deformPolygon(polygon: number[][]): number[][] {
    // 元のポリゴンの面積を計算
    const originalArea = this.calculatePolygonArea(polygon);
    
    const deformed = polygon.map(coord => this.snapToGrid(coord));
    
    // 重複点を削除（トポロジー保持のため）
    if (this.preserveTopology) {
      const unique: number[][] = [];
      const seen = new Set<string>();
      
      for (let i = 0; i < deformed.length; i++) {
        const key = `${deformed[i][0]},${deformed[i][1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(deformed[i]);
        }
      }
      
      // 最低3点必要（三角形）
      if (unique.length < 3) {
        // ポリゴンが小さすぎる場合、中心点を基準に最小の三角形または四角形を作成
        const center = this.calculatePolygonCenter(polygon);
        const snappedCenter = this.snapToGrid(center);
        
        // グリッドサイズの半分のオフセット
        const offset = this.gridSize / 2;
        
        // 小さな四角形を作成
        if (originalArea > this.gridSize * this.gridSize * 0.1) {
          return [
            [snappedCenter[0] - offset, snappedCenter[1] - offset],
            [snappedCenter[0] + offset, snappedCenter[1] - offset],
            [snappedCenter[0] + offset, snappedCenter[1] + offset],
            [snappedCenter[0] - offset, snappedCenter[1] + offset],
            [snappedCenter[0] - offset, snappedCenter[1] - offset]
          ];
        } else {
          // 非常に小さい場合は元の形状を保持
          return polygon;
        }
      }
      
      // 閉じたポリゴンにする
      if (unique[0][0] !== unique[unique.length - 1][0] || 
          unique[0][1] !== unique[unique.length - 1][1]) {
        unique.push([...unique[0]]);
      }
      
      return unique;
    }
    
    return deformed;
  }

  // ジオメトリをディフォルメ
  deformGeometry(geometry: any): any {
    if (geometry.type === 'Polygon') {
      const deformedRings = geometry.coordinates.map((ring: number[][]) => 
        this.deformPolygon(ring)
      );
      
      return {
        type: 'Polygon',
        coordinates: deformedRings
      };
    } else if (geometry.type === 'MultiPolygon') {
      // 各ポリゴンをディフォルメし、有効なものだけを保持
      const deformedPolygons = geometry.coordinates
        .map((polygon: number[][][]) => {
          const deformedRings = polygon.map((ring: number[][]) => this.deformPolygon(ring));
          
          // 外側のリング（最初のリング）の面積をチェック
          if (deformedRings.length > 0) {
            const area = this.calculatePolygonArea(deformedRings[0]);
            // 非常に小さいポリゴンは除外
            if (area < this.gridSize * this.gridSize * 0.01) {
              return null;
            }
          }
          
          return deformedRings;
        })
        .filter((polygon: number[][][] | null): polygon is number[][][] => polygon !== null);
      
      // 有効なポリゴンがない場合、最大のポリゴンを中心に四角形を作成
      if (deformedPolygons.length === 0) {
        // 元のジオメトリから最大のポリゴンを見つける
        let maxArea = 0;
        let maxPolygon = null;
        
        geometry.coordinates.forEach((polygon: number[][][]) => {
          if (polygon.length > 0) {
            const area = this.calculatePolygonArea(polygon[0]);
            if (area > maxArea) {
              maxArea = area;
              maxPolygon = polygon[0];
            }
          }
        });
        
        if (maxPolygon) {
          const center = this.calculatePolygonCenter(maxPolygon);
          const snappedCenter = this.snapToGrid(center);
          const offset = this.gridSize;
          
          // グリッドサイズの四角形を作成
          const square = [
            [snappedCenter[0] - offset, snappedCenter[1] - offset],
            [snappedCenter[0] + offset, snappedCenter[1] - offset],
            [snappedCenter[0] + offset, snappedCenter[1] + offset],
            [snappedCenter[0] - offset, snappedCenter[1] + offset],
            [snappedCenter[0] - offset, snappedCenter[1] - offset]
          ];
          
          return {
            type: 'Polygon',
            coordinates: [square]
          };
        }
      }
      
      // 単一のポリゴンになった場合
      if (deformedPolygons.length === 1) {
        return {
          type: 'Polygon',
          coordinates: deformedPolygons[0]
        };
      }
      
      return {
        type: 'MultiPolygon',
        coordinates: deformedPolygons
      };
    }
    
    return geometry;
  }

  // 都道府県をディフォルメ
  deformPrefecture(prefecture: Prefecture): Prefecture {
    return {
      ...prefecture,
      feature: {
        ...prefecture.feature,
        geometry: this.deformGeometry(prefecture.feature.geometry)
      }
    };
  }

  // 市区町村をディフォルメ
  deformMunicipality(municipality: Municipality): Municipality {
    return {
      ...municipality,
      feature: {
        ...municipality.feature,
        geometry: this.deformGeometry(municipality.feature.geometry)
      }
    };
  }

  // グリッドサイズを変更
  setGridSize(size: number) {
    this.gridSize = size;
  }

  // 特定地域用の調整（北海道、沖縄など）
  adjustForRegion(prefectureCode: string): void {
    switch (prefectureCode) {
      case '01': // 北海道
        this.gridSize = 0.2; // より大きなグリッド
        break;
      case '47': // 沖縄
        this.gridSize = 0.05; // より細かいグリッド
        break;
      case '13': // 東京
        this.gridSize = 0.02; // 都市部は細かく
        break;
      default:
        this.gridSize = 0.1; // デフォルト
    }
  }
}

// より高度なディフォルメ（六角形グリッド）
export class HexagonalGridDeformer extends GridDeformer {
  // 六角形グリッドにスナップ
  private snapToHexGrid(coord: number[]): number[] {
    const [lng, lat] = coord;
    const size = this.gridSize;
    
    // 六角形グリッドの計算
    const a = size * 2;
    const b = size * Math.sqrt(3);
    const c = size;
    
    // 最も近い六角形の中心を見つける
    const i = Math.round(lng / a);
    const j = Math.round(lat / b);
    
    // 偶数行と奇数行でオフセット
    const xOffset = (j % 2) * c;
    const hexX = i * a + xOffset;
    const hexY = j * b;
    
    return [hexX, hexY];
  }
  
  // ポリゴンをディフォルメ（オーバーライド）
  protected deformPolygon(polygon: number[][]): number[][] {
    const deformed = polygon.map(coord => this.snapToHexGrid(coord));
    
    if (this.preserveTopology) {
      const unique: number[][] = [];
      for (let i = 0; i < deformed.length; i++) {
        if (i === 0 || 
            deformed[i][0] !== deformed[i-1][0] || 
            deformed[i][1] !== deformed[i-1][1]) {
          unique.push(deformed[i]);
        }
      }
      
      if (unique.length < 3) {
        return polygon;
      }
      
      if (unique[0][0] !== unique[unique.length - 1][0] || 
          unique[0][1] !== unique[unique.length - 1][1]) {
        unique.push([...unique[0]]);
      }
      
      return unique;
    }
    
    return deformed;
  }
}