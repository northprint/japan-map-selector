# 都道府県別動的ローディング

v0.2.0から、都道府県を選択した時にその都道府県の市区町村データのみを動的に読み込む機能が追加されました。

## なぜ動的ローディングが必要か

従来の方式では、初回ロード時に全ての市区町村データ（約2.3MB）を読み込む必要がありました：

- 全1,741市区町村のデータを一括ダウンロード
- 実際に使用するのは選択した都道府県の市区町村のみ
- 初回表示に3-5秒かかることも

動的ローディングを使用すると：

- 初回は都道府県データのみ（約100KB）
- 選択時に必要な市区町村データのみ読み込み（10-200KB）
- 初回表示が10倍以上高速化

## 基本的な使い方

```javascript
import { JapanMapSelector } from 'japan-map-selector';

const selector = new JapanMapSelector({
  width: 800,
  height: 600,
  enableDynamicLoading: true, // 動的ローディングを有効化
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data'
});

// 都道府県データのみを読み込む
await selector.initialize(
  'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
  '' // 市区町村データのURLは空でOK
);
```

## ローディング状態の管理

データの読み込み状態を表示するには、コールバックを使用します：

```javascript
const selector = new JapanMapSelector({
  enableDynamicLoading: true,
  dynamicDataBaseUrl: './src/data',
  
  // 読み込み開始時
  onMunicipalityLoadStart: (prefecture) => {
    showLoader();
    updateStatus(`${prefecture.name}の市区町村データを読み込んでいます...`);
  },
  
  // 読み込み終了時
  onMunicipalityLoadEnd: (prefecture) => {
    hideLoader();
    updateStatus(`${prefecture.name}の市区町村を選択してください`);
  }
});
```

## CDNの使用

unpkgやjsDelivrなどのCDNを使用することで、さらに高速化できます：

```javascript
// unpkgを使用
const selector = new JapanMapSelector({
  enableDynamicLoading: true,
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data'
});

// jsDelivrを使用（より高速な場合あり）
const selector = new JapanMapSelector({
  enableDynamicLoading: true,
  dynamicDataBaseUrl: 'https://cdn.jsdelivr.net/npm/japan-map-selector@latest/src/data'
});
```

## 精度レベルの選択

動的ローディングでも精度レベルを選択できます：

```javascript
const selector = new JapanMapSelector({
  enableDynamicLoading: true,
  dynamicDataBaseUrl: './src/data',
  simplificationLevel: 'low' // low, medium, high, ultra-low
});
```

各精度レベルのデータサイズ（東京都の例）：
- `ultra-low`: 約11KB
- `low`: 約18KB
- `medium`: 約29KB
- `high`: 約48KB

## キャッシュの活用

一度読み込んだデータは内部でキャッシュされます：

```javascript
// 東京都を選択（初回は読み込みが発生）
await selector.selectPrefecture('13');

// 別の都道府県を選択
await selector.selectPrefecture('14');

// 再度東京都を選択（キャッシュから即座に表示）
await selector.selectPrefecture('13');
```

## 完全な実装例

```javascript
import { JapanMapSelector } from 'japan-map-selector';

// ローディング表示の要素
const loader = document.getElementById('loader');
const status = document.getElementById('status');

// セレクターを初期化
const selector = new JapanMapSelector({
  width: 800,
  height: 600,
  theme: 'default',
  enableDynamicLoading: true,
  dynamicDataBaseUrl: 'https://unpkg.com/japan-map-selector@latest/src/data',
  simplificationLevel: 'low',
  
  onPrefectureSelect: (prefecture) => {
    console.log(`選択: ${prefecture.name}`);
  },
  
  onMunicipalitySelect: (municipality) => {
    // 任意の処理（APIコール、ページ遷移など）
    window.location.href = `/municipality/${municipality.code}`;
  },
  
  onMunicipalityLoadStart: (prefecture) => {
    loader.style.display = 'block';
    status.textContent = `${prefecture.name}のデータを読み込み中...`;
  },
  
  onMunicipalityLoadEnd: (prefecture) => {
    loader.style.display = 'none';
    status.textContent = `${prefecture.name}の市区町村を選択してください`;
  }
});

// 初期化（都道府県のみ）
try {
  await selector.initialize(
    'https://unpkg.com/japan-map-selector@latest/src/data/simplified/prefectures-low.geojson',
    ''
  );
  status.textContent = '都道府県を選択してください';
} catch (error) {
  console.error('初期化エラー:', error);
  status.textContent = 'エラーが発生しました';
}
```

## パフォーマンス比較

| 項目 | 通常の読み込み | 動的ローディング |
|------|--------------|----------------|
| 初回ロード | 2.3MB | 100KB |
| 初回表示時間 | 3-5秒 | 0.2-0.5秒 |
| 都道府県選択時 | 即座 | 0.1-0.3秒 |
| メモリ使用量 | 全データ保持 | 必要な分のみ |

## 注意事項

1. **非同期処理**: `selectPrefecture`メソッドが非同期になります
2. **エラーハンドリング**: ネットワークエラーに備えて適切なエラー処理を実装してください
3. **CORS**: 異なるドメインからデータを読み込む場合はCORS設定に注意してください

## トラブルシューティング

### データが読み込めない

```javascript
// エラーハンドリングの例
selector.on('error', (error) => {
  console.error('エラー:', error);
  if (error.type === 'network') {
    alert('ネットワークエラーが発生しました');
  }
});
```

### 読み込みが遅い

1. CDNを使用する
2. より低い精度レベルを使用する
3. Service Workerでキャッシュを実装する

```javascript
// Service Workerでのキャッシュ例
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/prefectures/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('map-data-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```