#!/bin/bash

# ポリゴン簡略化スクリプト
# 使用方法: ./simplify-geojson.sh

# 出力ディレクトリの作成
mkdir -p src/data/simplified

echo "ポリゴンの簡略化を開始します..."

# 簡略化レベルの処理
simplify_data() {
    local level=$1
    local tolerance=$2
    
    echo "都道府県データを簡略化中 (${level}: tolerance=${tolerance})..."
    ogr2ogr \
        -f GeoJSON \
        -simplify $tolerance \
        "src/data/simplified/prefectures-${level}.geojson" \
        "src/data/prefectures.geojson"
    
    echo "市区町村データを簡略化中 (${level}: tolerance=${tolerance})..."
    ogr2ogr \
        -f GeoJSON \
        -simplify $tolerance \
        "src/data/simplified/municipalities-${level}.geojson" \
        "src/data/municipalities.geojson"
}

# 各レベルで簡略化を実行
simplify_data "high" "0.001"    # 高精度（最小限の簡略化）
simplify_data "medium" "0.005"  # 中精度
simplify_data "low" "0.01"      # 低精度（最大限の簡略化）

# ファイルサイズの比較
echo -e "\n=== ファイルサイズの比較 ==="
echo "オリジナル:"
ls -lh src/data/*.geojson | grep -E "(prefectures|municipalities).geojson" | grep -v sample

echo -e "\n簡略化後:"
ls -lh src/data/simplified/*.geojson

echo -e "\n簡略化が完了しました！"