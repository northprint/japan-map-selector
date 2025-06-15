#!/bin/bash

# 日本地図データダウンロードスクリプト

echo "日本地図データをダウンロードします..."

# データディレクトリの作成
mkdir -p src/data

# 全国の市区町村データを都道府県ごとにダウンロードして結合
echo "市区町村データをダウンロード中..."

# 一時ディレクトリ作成
mkdir -p temp_data

# 都道府県コード（01-47）
for i in $(seq -f "%02g" 1 47); do
    echo "都道府県 $i のデータをダウンロード中..."
    curl -s -L "https://raw.githubusercontent.com/smartnews-smri/japan-topography/master/data/municipality/geojson/s0010/N03-21_${i}_210101.json" -o "temp_data/municipality_${i}.json"
done

# ダウンロードしたファイルを結合してGeoJSON形式にする
echo "データを結合中..."
echo '{"type":"FeatureCollection","features":[' > src/data/municipalities.geojson

first=true
for file in temp_data/municipality_*.json; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        # 404エラーでないことを確認
        if ! grep -q "404" "$file"; then
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> src/data/municipalities.geojson
            fi
            # FeatureCollectionから features 配列の中身だけを抽出
            cat "$file" | jq -c '.features[]' >> src/data/municipalities.geojson
        fi
    fi
done

echo ']}' >> src/data/municipalities.geojson

# 都道府県データを市区町村データから生成
echo "都道府県データを生成中..."
cat src/data/municipalities.geojson | jq '
{
  type: "FeatureCollection",
  features: [
    .features | 
    group_by(.properties.N03_007[0:2]) | 
    map({
      type: "Feature",
      properties: {
        N03_001: .[0].properties.N03_001,
        N03_007: .[0].properties.N03_007[0:2] + "000"
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: map(.geometry.coordinates) | add
      }
    })
  ]
}' > src/data/prefectures.geojson

# 一時ファイルの削除
rm -rf temp_data

echo "データのダウンロードが完了しました！"
echo "- 都道府県データ: src/data/prefectures.geojson"
echo "- 市区町村データ: src/data/municipalities.geojson"