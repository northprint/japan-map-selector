# 出典表示について

Japan Map Selectorで使用している地理データは、国土交通省の国土数値情報から提供されています。利用にあたっては、適切な出典表示が必要です。

## 出典表示の要件

国土数値情報の利用約款に基づき、以下の出典表示を行う必要があります：

```
地図データ：「国土数値情報（行政区域データ）」（国土交通省）を加工して作成
```

## 自動出典表示機能

Japan Map Selectorには、出典表示を簡単に追加できるユーティリティ関数が含まれています。

### JavaScript での使用

```javascript
import { createAttributionElement } from 'japan-map-selector';

// 出典表示要素を作成
const attribution = createAttributionElement({
  showLink: true,
  position: 'bottom-right',
  style: {
    fontSize: '11px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  }
});

// コンテナに追加
document.getElementById('map-container').appendChild(attribution);
```

### React での使用

```jsx
import { Attribution } from 'japan-map-selector/react';

function MapWithAttribution() {
  return (
    <div style={{ position: 'relative' }}>
      <JapanMapSelectorReact
        width={800}
        height={600}
        // ... その他のプロパティ
      />
      <Attribution 
        showLink={true}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px'
        }}
      />
    </div>
  );
}
```

### HTML での直接記述

```html
<div class="map-container">
  <!-- 地図コンテンツ -->
  
  <div class="attribution">
    地図データ：<a href="https://nlftp.mlit.go.jp/ksj/index.html" target="_blank">
    国土数値情報（行政区域データ）</a>（国土交通省）を加工して作成
  </div>
</div>

<style>
.attribution {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 11px;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
```

## ユーティリティ関数

### getAttributionText()

出典表示のテキストを取得します。

```javascript
import { getAttributionText } from 'japan-map-selector';

const text = getAttributionText();
// => "地図データ：「国土数値情報（行政区域データ）」（国土交通省）を加工して作成"
```

### getAttributionHTML()

出典表示のHTMLを取得します。

```javascript
import { getAttributionHTML } from 'japan-map-selector';

const html = getAttributionHTML({ showLink: true });
// => '<div class="japan-map-attribution">地図データ：<a href="...">国土数値情報（行政区域データ）</a>（国土交通省）を加工して作成</div>'
```

### createAttributionElement()

DOM要素を作成します。

```javascript
import { createAttributionElement } from 'japan-map-selector';

const element = createAttributionElement({
  showLink: true,
  className: 'my-attribution',
  style: {
    fontSize: '10px',
    color: '#333'
  }
});
```

## オプション

| オプション | 型 | デフォルト | 説明 |
|----------|-----|----------|------|
| `showLink` | boolean | true | リンクを表示するか |
| `className` | string | 'japan-map-attribution' | CSSクラス名 |
| `style` | object | {} | インラインスタイル |

## デザインのカスタマイズ

### ダークテーマ用

```css
.japan-map-attribution.dark {
  background-color: rgba(0, 0, 0, 0.8);
  color: #ccc;
}

.japan-map-attribution.dark a {
  color: #66b3ff;
}
```

### 最小表示

```css
.japan-map-attribution.minimal {
  font-size: 10px;
  padding: 2px 6px;
  opacity: 0.7;
}

.japan-map-attribution.minimal:hover {
  opacity: 1;
}
```

## ベストプラクティス

1. **視認性の確保**: 背景色と十分なコントラストを持つ色を使用
2. **適切な配置**: 地図の邪魔にならない位置に配置（通常は右下）
3. **レスポンシブ対応**: モバイルでも読みやすいサイズを維持

```css
@media (max-width: 768px) {
  .japan-map-attribution {
    font-size: 10px;
    padding: 2px 6px;
  }
}
```

## 法的要件

国土数値情報の利用にあたっては、以下の点にご注意ください：

1. **出典の明記**: 必ず出典を明記してください
2. **改変の明示**: データを加工した場合は「加工して作成」の文言を含める
3. **商用利用**: 商用利用も可能ですが、出典表示は必須です

詳細は[国土数値情報ダウンロードサービス利用約款](https://nlftp.mlit.go.jp/ksj/other/agreement.html)をご確認ください。