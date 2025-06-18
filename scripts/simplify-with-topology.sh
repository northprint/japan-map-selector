#!/bin/bash

# トポロジーを保持したポリゴン簡略化スクリプト
# 使用方法: ./simplify-with-topology.sh

# 必要なツールの確認
command -v topojson-server >/dev/null 2>&1 || { 
    echo "topojson-serverが必要です。インストールしてください:"
    echo "npm install -g topojson-server topojson-client topojson-simplify"
    exit 1
}

# 出力ディレクトリの作成
mkdir -p src/data/simplified
mkdir -p tmp

echo "トポロジーを保持した簡略化を開始します..."

# GeoJSONをTopoJSONに変換して簡略化
process_with_topology() {
    local input_file=$1
    local output_prefix=$2
    local level=$3
    local simplify_param=$4
    
    echo "${output_prefix}を処理中 (${level})..."
    
    # Step 1: GeoJSON -> TopoJSON (量子化付き)
    geo2topo \
        "${input_file}=${output_prefix}" \
        -o "tmp/${output_prefix}-topo.json" \
        --quantization 1e5
    
    # Step 2: 簡略化
    toposimplify \
        -p ${simplify_param} \
        -f \
        < "tmp/${output_prefix}-topo.json" \
        > "tmp/${output_prefix}-${level}-simplified.json"
    
    # Step 3: TopoJSON -> GeoJSON
    topo2geo \
        "${output_prefix}=src/data/simplified/${output_prefix}-${level}.geojson" \
        < "tmp/${output_prefix}-${level}-simplified.json"
    
    # オプション: さらにogr2ogrで座標精度を調整
    if [ "$level" = "ultra-low" ]; then
        ogr2ogr \
            -f GeoJSON \
            -lco COORDINATE_PRECISION=3 \
            "src/data/simplified/${output_prefix}-${level}-final.geojson" \
            "src/data/simplified/${output_prefix}-${level}.geojson"
        mv "src/data/simplified/${output_prefix}-${level}-final.geojson" \
            "src/data/simplified/${output_prefix}-${level}.geojson"
    fi
}

# 都道府県の処理（既存の方法でOK）
echo "都道府県データの簡略化..."
ogr2ogr -f GeoJSON -simplify 0.01 -lco COORDINATE_PRECISION=4 \
    "src/data/simplified/prefectures-high.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.05 -lco COORDINATE_PRECISION=4 \
    "src/data/simplified/prefectures-medium.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.1 -lco COORDINATE_PRECISION=3 \
    "src/data/simplified/prefectures-low.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.5 -lco COORDINATE_PRECISION=2 \
    "src/data/simplified/prefectures-ultra-low.geojson" "src/data/prefectures.geojson"

# 市区町村の処理（トポロジー保持）
echo -e "\n市区町村データの簡略化（トポロジー保持）..."
process_with_topology "src/data/municipalities.geojson" "municipalities" "high" 0.8
process_with_topology "src/data/municipalities.geojson" "municipalities" "medium" 0.5
process_with_topology "src/data/municipalities.geojson" "municipalities" "low" 0.2
process_with_topology "src/data/municipalities.geojson" "municipalities" "ultra-low" 0.05

# 一時ファイルの削除
rm -rf tmp

# ファイルサイズの比較
echo -e "\n=== ファイルサイズの比較 ==="
echo "オリジナル:"
ls -lh src/data/*.geojson | grep -E "(prefectures|municipalities).geojson" | grep -v sample

echo -e "\n簡略化後:"
ls -lh src/data/simplified/*.geojson | sort -k9

echo -e "\n簡略化が完了しました！"