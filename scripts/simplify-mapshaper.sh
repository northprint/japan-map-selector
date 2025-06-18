#!/bin/bash

# Mapshaperを使用したトポロジー保持簡略化スクリプト
# 使用方法: ./simplify-mapshaper.sh

# Mapshaperのインストール確認
if ! command -v mapshaper &> /dev/null; then
    echo "mapshaperをインストールしています..."
    npm install -g mapshaper
fi

# 出力ディレクトリの作成
mkdir -p src/data/simplified

echo "Mapshaperを使用したトポロジー保持簡略化を開始します..."

# 都道府県の簡略化（既存の方法）
echo "都道府県データの簡略化..."
ogr2ogr -f GeoJSON -simplify 0.01 -lco COORDINATE_PRECISION=4 \
    "src/data/simplified/prefectures-high.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.05 -lco COORDINATE_PRECISION=4 \
    "src/data/simplified/prefectures-medium.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.1 -lco COORDINATE_PRECISION=3 \
    "src/data/simplified/prefectures-low.geojson" "src/data/prefectures.geojson"
ogr2ogr -f GeoJSON -simplify 0.5 -lco COORDINATE_PRECISION=2 \
    "src/data/simplified/prefectures-ultra-low.geojson" "src/data/prefectures.geojson"

# 市区町村の簡略化（Mapshaperでトポロジー保持）
echo -e "\n市区町村データの簡略化（トポロジー保持）..."

# 高精度（80%保持）
echo "市区町村 - 高精度..."
mapshaper src/data/municipalities.geojson \
    -simplify 80% keep-shapes \
    -clean \
    -o precision=0.0001 format=geojson src/data/simplified/municipalities-high.geojson

# 中精度（40%保持）
echo "市区町村 - 中精度..."
mapshaper src/data/municipalities.geojson \
    -simplify 40% keep-shapes \
    -clean \
    -o precision=0.0001 format=geojson src/data/simplified/municipalities-medium.geojson

# 低精度（20%保持）
echo "市区町村 - 低精度..."
mapshaper src/data/municipalities.geojson \
    -simplify 20% keep-shapes \
    -clean \
    -o precision=0.001 format=geojson src/data/simplified/municipalities-low.geojson

# 超低精度（5%保持）
echo "市区町村 - 超低精度..."
mapshaper src/data/municipalities.geojson \
    -simplify 5% keep-shapes \
    -clean \
    -o precision=0.01 format=geojson src/data/simplified/municipalities-ultra-low.geojson

# ファイルサイズの比較
echo -e "\n=== ファイルサイズの比較 ==="
echo "オリジナル:"
ls -lh src/data/*.geojson | grep -E "(prefectures|municipalities).geojson" | grep -v sample

echo -e "\n簡略化後:"
ls -lh src/data/simplified/*.geojson | sort -k9

echo -e "\n簡略化が完了しました！"