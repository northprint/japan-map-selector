# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-12-19

### Added
- 都道府県別データの動的読み込み機能
  - `enableDynamicLoading` オプションで有効化
  - 選択した都道府県の市区町村データのみを読み込み
  - 初回ロード時間を大幅に短縮（~100KB vs ~2.3MB）
- データ分割スクリプト (`npm run split-data`)
  - 市区町村データを都道府県別に分割
  - 各精度レベル（high, medium, low, ultra-low）に対応
- 動的ローディング用のコールバック
  - `onMunicipalityLoadStart`: データ読み込み開始時
  - `onMunicipalityLoadEnd`: データ読み込み終了時
- 都道府県別データのインデックスファイル

### Changed
- `selectPrefecture` メソッドが非同期に変更（動的ローディング対応）
- パフォーマンス最適化の推奨設定を更新

### Fixed
- TypeScript の型定義エラーを修正

## [0.1.2] - 2024-12-19

### Changed
- NPMパッケージサイズの最適化
- デフォルトでは中精度データのみを同梱
- パフォーマンス最適化のためのデフォルト設定変更

### Added
- CDN経由でのデータ読み込みサポート
- セッションストレージキャッシュ機能

## [0.1.1] - 2024-12-19

### Fixed
- データファイルパスの修正
- ドキュメントの更新

## [0.1.0] - 2024-12-18

### Added
- 初回リリース
- 日本の都道府県・市区町村の選択機能
- React、Svelte、Vanilla JSのサポート
- 複数のテーマオプション
- ズーム・パン機能
- 東京都離島の特別処理
- 沖縄県の別枠表示