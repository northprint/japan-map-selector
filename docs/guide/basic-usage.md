# 基本的な使い方

このガイドでは、Japan Map Selectorの基本的な使い方を説明します。

## シンプルな地図の表示

最も簡単な使い方は、地図を表示して都道府県を選択できるようにすることです。

### バニラJavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #map {
      width: 800px;
      height: 600px;
      border: 1px solid #ccc;
    }
    #info {
      margin-top: 10px;
      padding: 10px;
      background: #f0f0f0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="info">都道府県をクリックしてください</div>

  <script type="module">
    import { JapanMapSelector } from 'japan-map-selector';

    // 地図を初期化
    const map = new JapanMapSelector({
      width: 800,
      height: 600,
      theme: 'default'
    });

    // データを読み込む
    await map.initialize(
      '/data/prefectures.json',
      '/data/municipalities.json'
    );

    // イベントリスナーを設定
    map.on('prefectureSelected', (prefecture) => {
      document.getElementById('info').textContent = 
        `${prefecture.name}を選択しました。市区町村をクリックしてください。`;
    });

    map.on('municipalitySelected', (municipality) => {
      document.getElementById('info').textContent = 
        `${municipality.name}を選択しました。`;
    });

    // 地図を描画する関数
    function render() {
      const container = document.getElementById('map');
      const state = map.getState();
      const theme = map.getTheme();
      
      let svg = `<svg viewBox="${state.viewBox}" style="width: 100%; height: 100%; background: ${theme.backgroundColor};">`;
      
      if (!state.selectedPrefecture) {
        // 都道府県を描画
        map.getPrefectures().forEach(prefecture => {
          const path = map.getPrefecturePath(prefecture);
          const fill = map.getPrefectureFillColor(prefecture);
          const stroke = map.getPrefectureStrokeColor(prefecture);
          
          svg += `<path 
            d="${path}" 
            fill="${fill}" 
            stroke="${stroke}" 
            stroke-width="${theme.strokeWidth}"
            data-prefecture="${prefecture.code}"
            style="cursor: pointer;"
          />`;
        });
      } else {
        // 市区町村を描画
        map.getSelectedMunicipalities().forEach(municipality => {
          const path = map.getMunicipalityPath(municipality);
          const fill = map.getMunicipalityFillColor(municipality);
          
          svg += `<path 
            d="${path}" 
            fill="${fill}" 
            stroke="${theme.municipalityStroke}" 
            stroke-width="${theme.strokeWidth}"
            data-municipality="${municipality.code}"
            style="cursor: pointer;"
          />`;
        });
      }
      
      svg += '</svg>';
      container.innerHTML = svg;
      
      // クリックイベントを設定
      container.querySelectorAll('[data-prefecture]').forEach(el => {
        el.addEventListener('click', (e) => {
          const code = e.target.getAttribute('data-prefecture');
          map.selectPrefecture(code);
        });
      });
      
      container.querySelectorAll('[data-municipality]').forEach(el => {
        el.addEventListener('click', (e) => {
          const code = e.target.getAttribute('data-municipality');
          map.selectMunicipality(code);
        });
      });
    }

    // 状態変更時に再描画
    map.on('stateChanged', render);
    
    // 初回描画
    render();
  </script>
</body>
</html>
```

## ホバーエフェクトの追加

マウスオーバー時に地域をハイライトする機能を追加します。

```javascript
// ホバーイベントの追加
container.querySelectorAll('[data-prefecture]').forEach(el => {
  el.addEventListener('mouseenter', (e) => {
    const code = e.target.getAttribute('data-prefecture');
    map.hoverPrefecture(code);
  });
  
  el.addEventListener('mouseleave', () => {
    map.hoverPrefecture(null);
  });
});

// 描画時にホバー状態を反映
const fill = state.hoveredPrefecture?.code === prefecture.code 
  ? theme.prefectureHoverFill 
  : map.getPrefectureFillColor(prefecture);
```

## 戻るボタンの追加

市区町村表示から都道府県表示に戻るボタンを追加します。

```html
<button id="back-btn" style="display: none;">戻る</button>

<script>
  // 戻るボタンのイベント
  document.getElementById('back-btn').addEventListener('click', () => {
    map.resetView();
  });

  // 都道府県選択時にボタンを表示
  map.on('prefectureSelected', () => {
    document.getElementById('back-btn').style.display = 'block';
  });

  // リセット時にボタンを非表示
  map.on('stateChanged', (state) => {
    if (!state.selectedPrefecture) {
      document.getElementById('back-btn').style.display = 'none';
    }
  });
</script>
```

## テーマの切り替え

実行時にテーマを変更する機能を追加します。

```html
<select id="theme-select">
  <option value="default">Default</option>
  <option value="dark">Dark</option>
  <option value="warm">Warm</option>
  <option value="cool">Cool</option>
  <option value="monochrome">Monochrome</option>
  <option value="colorful">Colorful</option>
  <option value="random">Random</option>
</select>

<script>
  document.getElementById('theme-select').addEventListener('change', (e) => {
    map.setTheme(e.target.value);
  });
</script>
```

## 選択の制限

特定の都道府県のみ選択可能にする例です。

```javascript
// 関東地方のみ選択可能
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  selectablePrefectures: ['08', '09', '10', '11', '12', '13', '14'], // 茨城〜神奈川
  disabledPrefectureFill: '#cccccc',
  disabledPrefectureStroke: '#999999'
});
```

## ツールチップの表示

マウスオーバー時に地域名を表示します。

```javascript
// ツールチップ要素を作成
const tooltip = document.createElement('div');
tooltip.style.cssText = `
  position: absolute;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  display: none;
  font-size: 14px;
`;
document.body.appendChild(tooltip);

// マウス移動時にツールチップを更新
container.addEventListener('mousemove', (e) => {
  const target = e.target;
  if (target.tagName === 'path') {
    const prefCode = target.getAttribute('data-prefecture');
    const muniCode = target.getAttribute('data-municipality');
    
    if (prefCode) {
      const prefecture = map.getPrefectures().find(p => p.code === prefCode);
      tooltip.textContent = prefecture.name;
      tooltip.style.display = 'block';
    } else if (muniCode) {
      const municipalities = map.getSelectedMunicipalities();
      const municipality = municipalities.find(m => m.code === muniCode);
      tooltip.textContent = municipality.name;
      tooltip.style.display = 'block';
    }
    
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY - 30 + 'px';
  } else {
    tooltip.style.display = 'none';
  }
});
```

## パフォーマンスの最適化

大規模なアプリケーションでは、簡略化されたデータを使用することでパフォーマンスを向上できます。

```javascript
// 簡略化レベルを指定
const map = new JapanMapSelector({
  width: 800,
  height: 600,
  simplificationLevel: 'medium' // original, high, medium, low, ultra-low
});

// 対応するデータファイルを読み込む
await map.initialize(
  '/data/prefectures-medium.json',
  '/data/municipalities-medium.json'
);
```

## 次のステップ

- [カスタマイズ](/guide/customization) - 見た目や動作の詳細な設定
- [イベント処理](/guide/events) - 利用可能なイベントとその使い方
- [React での使用](/examples/react) - React コンポーネントとしての使用方法
- [Svelte での使用](/examples/svelte) - Svelte コンポーネントとしての使用方法