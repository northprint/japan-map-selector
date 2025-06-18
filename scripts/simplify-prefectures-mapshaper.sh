#!/bin/bash

# Mapshaperを使用して都道府県データを簡略化するスクリプト
# 隣接する都道府県の境界線を保持しながら簡略化

# 入力ファイル
INPUT_FILE="src/data/prefectures.geojson"
OUTPUT_DIR="src/data/simplified"

# 出力ディレクトリの作成
mkdir -p "$OUTPUT_DIR"

echo "都道府県データの簡略化を開始..."

# Ultra-low quality (99%簡略化) - 非常に軽量、モバイル向け
echo "Ultra-low qualityバージョンを生成中..."
npx mapshaper "$INPUT_FILE" \
  -simplify 1% weighted \
  -clean \
  -o "$OUTPUT_DIR/prefectures-ultra-low.geojson" \
  format=geojson \
  precision=0.000001

# Low quality (95%簡略化) - 軽量、基本的な表示向け  
echo "Low qualityバージョンを生成中..."
npx mapshaper "$INPUT_FILE" \
  -simplify 5% weighted \
  -clean \
  -o "$OUTPUT_DIR/prefectures-low.geojson" \
  format=geojson \
  precision=0.000001

# Medium quality (80%簡略化) - バランス重視
echo "Medium qualityバージョンを生成中..."
npx mapshaper "$INPUT_FILE" \
  -simplify 20% weighted \
  -clean \
  -o "$OUTPUT_DIR/prefectures-medium.geojson" \
  format=geojson \
  precision=0.00001

# High quality (50%簡略化) - 詳細表示向け
echo "High qualityバージョンを生成中..."
npx mapshaper "$INPUT_FILE" \
  -simplify 50% weighted \
  -clean \
  -o "$OUTPUT_DIR/prefectures-high.geojson" \
  format=geojson \
  precision=0.00001

echo ""
echo "簡略化が完了しました！"
echo ""

# ファイルサイズの表示
echo "生成されたファイルのサイズ:"
ls -lh "$OUTPUT_DIR"/prefectures-*.geojson | awk '{print $9 ": " $5}'

echo ""
echo "オリジナルファイルのサイズ:"
ls -lh "$INPUT_FILE" | awk '{print $9 ": " $5}'