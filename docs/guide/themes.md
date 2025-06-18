# テーマ

Japan Map Selectorは、7つのプリセットテーマとカスタムテーマをサポートしています。

## プリセットテーマ

### Default（デフォルト）
シンプルでクリーンなデザイン。ほとんどのアプリケーションに適合します。

```javascript
const map = new JapanMapSelector({
  theme: 'default'
});
```

<div style="background: #f8f8f8; padding: 20px; border: 1px solid #ddd;">
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #e0e0e0; border: 1px solid #999;"></div>
    <small>都道府県</small>
  </div>
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #b0d0f0; border: 1px solid #999;"></div>
    <small>ホバー時</small>
  </div>
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #f0f0f0; border: 1px solid #666;"></div>
    <small>市区町村</small>
  </div>
</div>

### Dark（ダーク）
ダークモードに最適化されたテーマ。

```javascript
const map = new JapanMapSelector({
  theme: 'dark'
});
```

<div style="background: #1a1a1a; padding: 20px; border: 1px solid #333;">
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #2a2a2a; border: 1px solid #555;"></div>
    <small style="color: #ccc;">都道府県</small>
  </div>
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #404040; border: 1px solid #555;"></div>
    <small style="color: #ccc;">ホバー時</small>
  </div>
  <div style="display: inline-block; margin: 5px;">
    <div style="width: 100px; height: 30px; background: #333333; border: 1px solid #555;"></div>
    <small style="color: #ccc;">市区町村</small>
  </div>
</div>

### Colorful（カラフル）
各都道府県に個別の色を割り当てる、視覚的に魅力的なテーマ。

```javascript
const map = new JapanMapSelector({
  theme: 'colorful'
});
```

都道府県ごとに以下のような色が割り当てられます：
- 北海道: #FF6B6B
- 青森県: #4ECDC4
- 岩手県: #45B7D1
- ...など

### Random（ランダム）
都道府県コードを基に動的に色を生成するテーマ。

```javascript
const map = new JapanMapSelector({
  theme: 'random'
});
```

HSL色空間を使用して、各都道府県に一意の色を生成します。

### その他のテーマ

- **Warm（ウォーム）**: 暖色系の配色
- **Cool（クール）**: 寒色系の配色
- **Monochrome（モノクローム）**: グレースケールの配色

## カスタムテーマの作成

独自のテーマを作成することも可能です：

```javascript
const customTheme = {
  name: 'My Custom Theme',
  prefectureFill: '#ffcc00',
  prefectureStroke: '#ff6600',
  prefectureHoverFill: '#ff9900',
  prefectureSelectedFill: '#ff3300',
  municipalityFill: '#ffffcc',
  municipalityStroke: '#ffcc66',
  municipalityHoverFill: '#ffff99',
  municipalitySelectedFill: '#ffcc33',
  backgroundColor: '#fff9f0',
  strokeWidth: 1.0
};

const map = new JapanMapSelector({
  theme: customTheme
});
```

### テーマのプロパティ

| プロパティ | 説明 | デフォルト値 |
|----------|------|------------|
| `prefectureFill` | 都道府県の塗りつぶし色 | #e0e0e0 |
| `prefectureStroke` | 都道府県の枠線色 | #999 |
| `prefectureHoverFill` | 都道府県のホバー時の色 | #b0d0f0 |
| `prefectureSelectedFill` | 都道府県の選択時の色 | #90c0ff |
| `municipalityFill` | 市区町村の塗りつぶし色 | #f0f0f0 |
| `municipalityStroke` | 市区町村の枠線色 | #666 |
| `municipalityHoverFill` | 市区町村のホバー時の色 | #b0d0f0 |
| `municipalitySelectedFill` | 市区町村の選択時の色 | #90c0ff |
| `backgroundColor` | 背景色 | #f8f8f8 |
| `strokeWidth` | 枠線の太さ | 0.5 |

## 動的なテーマ変更

実行時にテーマを変更することも可能です：

```javascript
// テーマを変更
map.setTheme('dark');

// カスタムテーマに変更
map.setTheme(customTheme);

// 現在のテーマを取得
const currentTheme = map.getTheme();
```

## 個別の色設定

テーマとは別に、特定の色だけを上書きすることもできます：

```javascript
const map = new JapanMapSelector({
  theme: 'default',
  prefectureColor: '#ff0000',      // 都道府県の色を赤に
  prefectureHoverColor: '#ff6666', // ホバー時の色を明るい赤に
});
```

## 選択不可な都道府県のスタイル

選択できない都道府県には別のスタイルを適用できます：

```javascript
const map = new JapanMapSelector({
  selectablePrefectures: ['13', '14', '11', '12'], // 関東の一部のみ選択可能
  disabledPrefectureFill: '#cccccc',
  disabledPrefectureStroke: '#999999'
});
```