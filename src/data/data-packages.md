# データパッケージ構成

## メインパッケージ (japan-map-selector)
- 中精度データのみを含む
- src/data/simplified/prefectures-medium.geojson
- src/data/simplified/municipalities-medium.geojson
- 合計サイズ: 約2.3MB

## オプショナルパッケージ

### japan-map-selector-data-original
- オリジナル（最高精度）データ
- src/data/prefectures.geojson
- src/data/municipalities.geojson
- 合計サイズ: 約10.7MB

### japan-map-selector-data-high
- 高精度データ
- src/data/simplified/prefectures-high.geojson
- src/data/simplified/municipalities-high.geojson
- 合計サイズ: 約4.1MB

### japan-map-selector-data-low
- 低精度データ
- src/data/simplified/prefectures-low.geojson
- src/data/simplified/municipalities-low.geojson
- 合計サイズ: 約1.3MB

### japan-map-selector-data-ultra-low
- 超低精度データ
- src/data/simplified/prefectures-ultra-low.geojson
- src/data/simplified/municipalities-ultra-low.geojson
- 合計サイズ: 約696KB