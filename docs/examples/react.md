# React での使用

Japan Map SelectorをReactアプリケーションで使用する方法を説明します。

## 基本的な使用方法

```jsx
import React from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function App() {
  const handlePrefectureSelect = (prefecture) => {
    console.log('選択された都道府県:', prefecture.name);
  };

  const handleMunicipalitySelect = (municipality) => {
    console.log('選択された市区町村:', municipality.name);
  };

  return (
    <div>
      <h1>日本地図セレクター</h1>
      <JapanMapSelectorReact
        width={800}
        height={600}
        theme="colorful"
        prefectureDataUrl="/data/prefectures.json"
        municipalityDataUrl="/data/municipalities.json"
        onPrefectureSelect={handlePrefectureSelect}
        onMunicipalitySelect={handleMunicipalitySelect}
      />
    </div>
  );
}

export default App;
```

## プロパティ

### 必須プロパティ

| プロパティ | 型 | 説明 |
|----------|-----|------|
| `prefectureDataUrl` | string | 都道府県データのURL |
| `municipalityDataUrl` | string | 市区町村データのURL |

### オプションプロパティ

| プロパティ | 型 | デフォルト | 説明 |
|----------|-----|----------|------|
| `width` | number | 800 | 地図の幅 |
| `height` | number | 600 | 地図の高さ |
| `theme` | string \| ColorTheme | 'default' | テーマ設定 |
| `simplificationLevel` | string | 'original' | 簡略化レベル |
| `selectedPrefectureCode` | string | undefined | 初期選択の都道府県コード |
| `selectablePrefectures` | string[] | undefined | 選択可能な都道府県コード |

### コールバック

| プロパティ | 型 | 説明 |
|----------|-----|------|
| `onPrefectureSelect` | (prefecture: Prefecture) => void | 都道府県選択時 |
| `onMunicipalitySelect` | (municipality: Municipality) => void | 市区町村選択時 |

## 状態管理との連携

### useStateを使った例

```jsx
import React, { useState } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithState() {
  const [selectedPrefecture, setSelectedPrefecture] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div>
        <JapanMapSelectorReact
          width={600}
          height={450}
          theme="colorful"
          prefectureDataUrl="/data/prefectures.json"
          municipalityDataUrl="/data/municipalities.json"
          onPrefectureSelect={setSelectedPrefecture}
          onMunicipalitySelect={setSelectedMunicipality}
        />
      </div>
      
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h3>選択情報</h3>
        {selectedPrefecture && (
          <div>
            <strong>都道府県:</strong> {selectedPrefecture.name}<br />
            <strong>コード:</strong> {selectedPrefecture.code}
          </div>
        )}
        {selectedMunicipality && (
          <div style={{ marginTop: '10px' }}>
            <strong>市区町村:</strong> {selectedMunicipality.name}<br />
            <strong>コード:</strong> {selectedMunicipality.code}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Reduxとの連携

```jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { JapanMapSelectorReact } from 'japan-map-selector/react';
import { selectPrefecture, selectMunicipality } from './mapSlice';

function MapWithRedux() {
  const dispatch = useDispatch();
  const { selectedPrefecture, theme } = useSelector(state => state.map);

  return (
    <JapanMapSelectorReact
      width={800}
      height={600}
      theme={theme}
      selectedPrefectureCode={selectedPrefecture?.code}
      prefectureDataUrl="/data/prefectures.json"
      municipalityDataUrl="/data/municipalities.json"
      onPrefectureSelect={(prefecture) => {
        dispatch(selectPrefecture(prefecture));
      }}
      onMunicipalitySelect={(municipality) => {
        dispatch(selectMunicipality(municipality));
      }}
    />
  );
}
```

## 動的なテーマ変更

```jsx
import React, { useState } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithThemeSelector() {
  const [theme, setTheme] = useState('default');
  const [customColors, setCustomColors] = useState({});

  const themes = [
    'default', 'dark', 'warm', 'cool', 
    'monochrome', 'colorful', 'random'
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label>テーマ: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          {themes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        
        <label style={{ marginLeft: '20px' }}>
          <input
            type="checkbox"
            onChange={(e) => {
              setCustomColors(e.target.checked ? {
                prefectureColor: '#ff6b6b',
                prefectureHoverColor: '#ff9999'
              } : {});
            }}
          />
          カスタム色を使用
        </label>
      </div>
      
      <JapanMapSelectorReact
        width={800}
        height={600}
        theme={theme}
        {...customColors}
        prefectureDataUrl="/data/prefectures.json"
        municipalityDataUrl="/data/municipalities.json"
      />
    </div>
  );
}
```

## データの可視化

```jsx
import React, { useState, useEffect } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function PopulationMap() {
  const [populationData, setPopulationData] = useState({});
  
  useEffect(() => {
    // 人口データを読み込む（仮の例）
    fetch('/data/population.json')
      .then(res => res.json())
      .then(data => setPopulationData(data));
  }, []);

  // 人口に基づいて色を生成
  const getColorByPopulation = (prefectureCode) => {
    const population = populationData[prefectureCode];
    if (!population) return '#e0e0e0';
    
    // 人口に応じて色の濃さを変える
    const intensity = Math.min(population / 10000000, 1);
    const red = Math.floor(255 * (1 - intensity));
    const blue = Math.floor(255 * intensity);
    return `rgb(${red}, 0, ${blue})`;
  };

  // カスタムテーマを作成
  const customTheme = {
    name: 'Population',
    prefectureFill: '#e0e0e0',
    prefectureStroke: '#666',
    prefectureHoverFill: '#ffff99',
    prefectureSelectedFill: '#ff9900',
    municipalityFill: '#f0f0f0',
    municipalityStroke: '#999',
    municipalityHoverFill: '#ccccff',
    municipalitySelectedFill: '#9999ff',
    backgroundColor: '#f8f8f8',
    strokeWidth: 0.5
  };

  return (
    <div>
      <h2>都道府県別人口分布</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <JapanMapSelectorReact
          width={600}
          height={450}
          theme={customTheme}
          prefectureDataUrl="/data/prefectures.json"
          municipalityDataUrl="/data/municipalities.json"
          onPrefectureSelect={(prefecture) => {
            alert(`${prefecture.name}の人口: ${populationData[prefecture.code]?.toLocaleString() || '不明'}`);
          }}
        />
        
        <div>
          <h3>凡例</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 200, height: 20, background: 'linear-gradient(to right, rgb(255,0,0), rgb(0,0,255))' }} />
            <span>少 → 多</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## カスタムコントロール

```jsx
import React, { useRef, useState } from 'react';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithControls() {
  const mapRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (!mapRef.current || !searchTerm) return;
    
    // 都道府県を検索
    const prefectures = mapRef.current.getPrefectures();
    const found = prefectures.find(p => p.name.includes(searchTerm));
    
    if (found) {
      mapRef.current.selectPrefecture(found.code);
    } else {
      alert('該当する都道府県が見つかりません');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="都道府県名を入力"
        />
        <button onClick={handleSearch}>検索</button>
        <button onClick={() => mapRef.current?.resetView()}>リセット</button>
      </div>
      
      <JapanMapSelectorReact
        ref={mapRef}
        width={800}
        height={600}
        theme="colorful"
        prefectureDataUrl="/data/prefectures.json"
        municipalityDataUrl="/data/municipalities.json"
      />
    </div>
  );
}
```

## トラブルシューティング

### よくある問題

1. **地図が表示されない**
   - データファイルのパスが正しいか確認
   - ネットワークタブでデータが正常に読み込まれているか確認

2. **クリックが効かない**
   - イベントハンドラーが正しく設定されているか確認
   - 他の要素がオーバーレイしていないか確認

3. **スタイルが適用されない**
   - CSSの読み込み順序を確認
   - スタイルの詳細度を確認

### パフォーマンスの最適化

```jsx
// React.memoを使用してメモ化
const MemoizedMap = React.memo(JapanMapSelectorReact, (prevProps, nextProps) => {
  // プロパティが変更されていない場合は再レンダリングをスキップ
  return prevProps.theme === nextProps.theme &&
         prevProps.selectedPrefectureCode === nextProps.selectedPrefectureCode;
});

// 使用例
<MemoizedMap
  width={800}
  height={600}
  theme={theme}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```