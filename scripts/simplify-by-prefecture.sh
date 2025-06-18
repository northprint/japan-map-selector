#!/bin/bash

# 都道府県ごとに市区町村をグループ化して簡略化するスクリプト
# 境界線の整合性をより確実に保持

mkdir -p src/data/simplified-grouped
mkdir -p tmp/prefectures

echo "都道府県ごとにグループ化した簡略化を開始します..."

# 都道府県コードのリスト
PREFECTURE_CODES=(01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47)

# 各都道府県の市区町村を抽出
echo "都道府県ごとに市区町村データを分割中..."
for code in "${PREFECTURE_CODES[@]}"; do
    ogr2ogr \
        -f GeoJSON \
        -where "SUBSTR(N03_007, 1, 2) = '${code}'" \
        "tmp/prefectures/municipalities-${code}.geojson" \
        "src/data/municipalities.geojson" 2>/dev/null
    
    # ファイルが作成されたかチェック
    if [ -f "tmp/prefectures/municipalities-${code}.geojson" ]; then
        echo "都道府県 ${code} の市区町村を抽出"
    fi
done

# 各簡略化レベルで処理
for level in high medium low ultra-low; do
    echo -e "\n${level}レベルの簡略化を開始..."
    
    # 簡略化パラメータの設定
    case $level in
        high)
            SIMPLIFY_PARAM="70%"
            PRECISION="0.0001"
            ;;
        medium)
            SIMPLIFY_PARAM="35%"
            PRECISION="0.0001"
            ;;
        low)
            SIMPLIFY_PARAM="15%"
            PRECISION="0.001"
            ;;
        ultra-low)
            SIMPLIFY_PARAM="5%"
            PRECISION="0.01"
            ;;
    esac
    
    # 各都道府県を個別に簡略化
    for code in "${PREFECTURE_CODES[@]}"; do
        if [ -f "tmp/prefectures/municipalities-${code}.geojson" ]; then
            mapshaper "tmp/prefectures/municipalities-${code}.geojson" \
                -simplify ${SIMPLIFY_PARAM} keep-shapes weighted \
                -clean \
                -o precision=${PRECISION} format=geojson \
                "tmp/prefectures/simplified-${level}-${code}.geojson" 2>/dev/null
        fi
    done
    
    # 簡略化された都道府県データを結合
    echo "簡略化されたデータを結合中..."
    
    # 最初のファイルをベースにする
    first_file=""
    for code in "${PREFECTURE_CODES[@]}"; do
        if [ -f "tmp/prefectures/simplified-${level}-${code}.geojson" ]; then
            first_file="tmp/prefectures/simplified-${level}-${code}.geojson"
            break
        fi
    done
    
    if [ -n "$first_file" ]; then
        # すべてのファイルを結合
        mapshaper tmp/prefectures/simplified-${level}-*.geojson \
            -merge-layers \
            -clean \
            -o format=geojson "src/data/simplified-grouped/municipalities-${level}.geojson"
    fi
done

# 元の簡略化ファイルと比較できるようにコピー
echo -e "\nファイルをコピー中..."
cp src/data/simplified-grouped/municipalities-*.geojson src/data/simplified/

# 一時ファイルの削除
rm -rf tmp/prefectures

# ファイルサイズの比較
echo -e "\n=== ファイルサイズの比較 ==="
echo "オリジナル:"
ls -lh src/data/municipalities.geojson

echo -e "\n簡略化後（グループ化版）:"
ls -lh src/data/simplified-grouped/*.geojson

echo -e "\n都道府県ごとのグループ化簡略化が完了しました！"