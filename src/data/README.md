# 地理データについて

このコンポーネントを使用するには、日本の都道府県と市区町村のGeoJSONデータが必要です。

## データの入手方法

### オプション1: 国土数値情報からダウンロード

1. [国土数値情報ダウンロードサービス](https://nlftp.mlit.go.jp/ksj/)にアクセス
2. 「行政区域」データをダウンロード
3. GeoJSON形式に変換

### オプション2: Natural Earthデータ

簡易版として、Natural Earthのデータを使用することもできます：

```bash
# 都道府県レベルのデータ（簡易版）
curl -L "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson" -o prefectures_temp.geojson

# 日本のみを抽出（要jqコマンド）
cat prefectures_temp.geojson | jq '.features[] | select(.properties.admin == "Japan")' > prefectures.geojson
```

### オプション3: サンプルデータ

テスト用の簡易データを以下に用意しています：

- `prefectures.geojson`: 都道府県データ（手動で作成が必要）
- `municipalities.geojson`: 市区町村データ（手動で作成が必要）

## データ形式

データは以下の形式である必要があります：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "N03_001": "都道府県名",
        "N03_004": "市区町村名",
        "N03_007": "行政区域コード"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[経度, 緯度], ...]]
      }
    }
  ]
}
```