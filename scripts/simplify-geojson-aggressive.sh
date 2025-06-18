#!/bin/bash

# より積極的なポリゴン簡略化スクリプト
# 使用方法: ./simplify-geojson-aggressive.sh

# 出力ディレクトリの作成
mkdir -p src/data/simplified

echo "より積極的なポリゴンの簡略化を開始します..."

# 簡略化レベルの処理
simplify_data() {
    local level=$1
    local tolerance=$2
    
    echo "都道府県データを簡略化中 (${level}: tolerance=${tolerance})..."
    ogr2ogr \
        -f GeoJSON \
        -simplify $tolerance \
        -lco COORDINATE_PRECISION=4 \
        "src/data/simplified/prefectures-${level}.geojson" \
        "src/data/prefectures.geojson"
    
    echo "市区町村データを簡略化中 (${level}: tolerance=${tolerance})..."
    ogr2ogr \
        -f GeoJSON \
        -simplify $tolerance \
        -lco COORDINATE_PRECISION=4 \
        "src/data/simplified/municipalities-${level}.geojson" \
        "src/data/municipalities.geojson"
}

# 各レベルで簡略化を実行（より大胆な値に変更）
simplify_data "high" "0.01"     # 高精度（以前のlow相当）
simplify_data "medium" "0.05"   # 中精度（5倍の簡略化）
simplify_data "low" "0.1"       # 低精度（10倍の簡略化）

# 超低精度版も作成
echo "超低精度版を作成中..."
ogr2ogr \
    -f GeoJSON \
    -simplify 0.5 \
    -lco COORDINATE_PRECISION=2 \
    "src/data/simplified/prefectures-ultra-low.geojson" \
    "src/data/prefectures.geojson"

ogr2ogr \
    -f GeoJSON \
    -simplify 0.5 \
    -lco COORDINATE_PRECISION=2 \
    "src/data/simplified/municipalities-ultra-low.geojson" \
    "src/data/municipalities.geojson"

# ファイルサイズの比較
echo -e "\n=== ファイルサイズの比較 ==="
echo "オリジナル:"
ls -lh src/data/*.geojson | grep -E "(prefectures|municipalities).geojson" | grep -v sample

echo -e "\n簡略化後:"
ls -lh src/data/simplified/*.geojson | sort -k9

# ポリゴンの頂点数を確認
echo -e "\n=== ポリゴンの頂点数（概算）==="
echo "オリジナル:"
echo -n "都道府県: "
grep -o '\[' src/data/prefectures.geojson | wc -l
echo -n "市区町村: "
grep -o '\[' src/data/municipalities.geojson | wc -l

echo -e "\n簡略化後:"
for file in src/data/simplified/*.geojson; do
    basename=$(basename "$file")
    echo -n "$basename: "
    grep -o '\[' "$file" | wc -l
done

echo -e "\n簡略化が完了しました！"