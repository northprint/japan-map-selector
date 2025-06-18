# Svelteでの使用

Japan Map SelectorをSvelteプロジェクトで使用する方法を説明します。

## インストール

```bash
npm install japan-map-selector
```

## 基本的な使い方

### コンポーネントの作成

```svelte
<!-- MapSelector.svelte -->
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let selectedPrefecture = null;
  let selectedMunicipality = null;
  
  function handlePrefectureSelect(event) {
    selectedPrefecture = event.detail;
    selectedMunicipality = null;
  }
  
  function handleMunicipalitySelect(event) {
    selectedMunicipality = event.detail;
  }
</script>

<div class="map-container">
  <JapanMapSelectorSvelte
    width={800}
    height={600}
    theme="colorful"
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
    on:prefectureSelect={handlePrefectureSelect}
    on:municipalitySelect={handleMunicipalitySelect}
  />
  
  <div class="info-panel">
    {#if selectedMunicipality}
      <h3>{selectedMunicipality.name}</h3>
      <p>市区町村コード: {selectedMunicipality.code}</p>
    {:else if selectedPrefecture}
      <h3>{selectedPrefecture.name}</h3>
      <p>都道府県コード: {selectedPrefecture.code}</p>
      <p>市区町村を選択してください</p>
    {:else}
      <p>都道府県を選択してください</p>
    {/if}
  </div>
</div>

<style>
  .map-container {
    display: flex;
    gap: 20px;
  }
  
  .info-panel {
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
    min-width: 200px;
  }
</style>
```

## 高度な使い方

### リアクティブなテーマ変更

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let theme = 'default';
  let simplificationLevel = 'medium';
  
  const themes = [
    'default', 'dark', 'warm', 'cool', 
    'monochrome', 'colorful', 'random'
  ];
</script>

<div class="controls">
  <label>
    テーマ:
    <select bind:value={theme}>
      {#each themes as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </label>
  
  <label>
    簡略化レベル:
    <select bind:value={simplificationLevel}>
      <option value="original">Original</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
      <option value="ultra-low">Ultra Low</option>
    </select>
  </label>
</div>

<JapanMapSelectorSvelte
  {theme}
  {simplificationLevel}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```

### ストアを使った状態管理

```javascript
// mapStore.js
import { writable, derived } from 'svelte/store';

export const selectedPrefecture = writable(null);
export const selectedMunicipality = writable(null);
export const mapTheme = writable('default');

export const selectionInfo = derived(
  [selectedPrefecture, selectedMunicipality],
  ([$prefecture, $municipality]) => {
    if ($municipality) {
      return {
        type: 'municipality',
        name: $municipality.name,
        code: $municipality.code
      };
    } else if ($prefecture) {
      return {
        type: 'prefecture',
        name: $prefecture.name,
        code: $prefecture.code
      };
    }
    return null;
  }
);
```

```svelte
<!-- MapWithStore.svelte -->
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  import { 
    selectedPrefecture, 
    selectedMunicipality, 
    mapTheme,
    selectionInfo 
  } from './mapStore.js';
  
  function handlePrefectureSelect(event) {
    $selectedPrefecture = event.detail;
    $selectedMunicipality = null;
  }
  
  function handleMunicipalitySelect(event) {
    $selectedMunicipality = event.detail;
  }
</script>

<JapanMapSelectorSvelte
  theme={$mapTheme}
  on:prefectureSelect={handlePrefectureSelect}
  on:municipalitySelect={handleMunicipalitySelect}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>

{#if $selectionInfo}
  <div class="selection-info">
    選択中: {$selectionInfo.name} ({$selectionInfo.code})
  </div>
{/if}
```

### アニメーション付きの選択

```svelte
<script>
  import { fade, fly } from 'svelte/transition';
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let selectedItem = null;
  let showDetails = false;
  
  function handleSelect(event) {
    selectedItem = event.detail;
    showDetails = true;
  }
</script>

<div class="container">
  <JapanMapSelectorSvelte
    on:municipalitySelect={handleSelect}
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
  />
  
  {#if showDetails && selectedItem}
    <div 
      class="details-panel"
      transition:fly={{ x: 200, duration: 300 }}
    >
      <button on:click={() => showDetails = false}>×</button>
      <h3>{selectedItem.name}</h3>
      <p>コード: {selectedItem.code}</p>
      <!-- 追加の詳細情報 -->
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
  }
  
  .details-panel {
    position: absolute;
    right: 20px;
    top: 20px;
    background: white;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 8px;
  }
</style>
```

### カスタムアクション

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let mapRef;
  
  // カスタムアクションの定義
  function mapActions(node, map) {
    // ショートカットキーの追加
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        map.resetView();
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    return {
      destroy() {
        document.removeEventListener('keydown', handleKeydown);
      }
    };
  }
  
  function searchPrefecture(name) {
    if (mapRef) {
      const prefectures = mapRef.getPrefectures();
      const match = prefectures.find(p => p.name.includes(name));
      if (match) {
        mapRef.selectPrefecture(match.code);
      }
    }
  }
</script>

<div use:mapActions={mapRef}>
  <JapanMapSelectorSvelte
    bind:this={mapRef}
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
  />
</div>

<input 
  type="text" 
  placeholder="都道府県を検索..."
  on:input={(e) => searchPrefecture(e.target.value)}
/>
```

### SSR対応

```javascript
// +page.js
export const ssr = false; // 地図コンポーネントはクライアントサイドのみ
```

または条件付きレンダリング：

```svelte
<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let MapComponent;
  
  onMount(async () => {
    if (browser) {
      const module = await import('japan-map-selector/svelte');
      MapComponent = module.JapanMapSelectorSvelte;
    }
  });
</script>

{#if MapComponent}
  <svelte:component 
    this={MapComponent}
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
  />
{:else}
  <div>地図を読み込み中...</div>
{/if}
```

## 実装例

### データ可視化との組み合わせ

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let populationData = {};
  let selectedPrefecture = null;
  
  // 人口データを読み込み
  async function loadPopulationData() {
    const response = await fetch('/api/population');
    populationData = await response.json();
  }
  
  // カスタムテーマで人口密度を可視化
  function getColorByPopulation(prefectureCode) {
    const population = populationData[prefectureCode];
    if (!population) return '#e0e0e0';
    
    // 人口密度に応じて色を変更
    const density = population.density;
    if (density > 1000) return '#d32f2f';
    if (density > 500) return '#f57c00';
    if (density > 200) return '#fbc02d';
    if (density > 100) return '#689f38';
    return '#388e3c';
  }
  
  onMount(loadPopulationData);
</script>

<JapanMapSelectorSvelte
  prefectureColor={(prefecture) => getColorByPopulation(prefecture.code)}
  on:prefectureSelect={(e) => selectedPrefecture = e.detail}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>

{#if selectedPrefecture && populationData[selectedPrefecture.code]}
  <div class="population-info">
    <h3>{selectedPrefecture.name}</h3>
    <p>人口: {populationData[selectedPrefecture.code].total.toLocaleString()}人</p>
    <p>人口密度: {populationData[selectedPrefecture.code].density}人/km²</p>
  </div>
{/if}
```

## トラブルシューティング

### よくある問題

1. **地図が表示されない**
   - データファイルのパスを確認
   - ブラウザのコンソールでエラーを確認
   - SSRを無効化しているか確認

2. **イベントが発火しない**
   - `on:prefectureSelect`のように`on:`プレフィックスを使用
   - イベント名のスペルを確認

3. **スタイルが適用されない**
   - グローバルスタイルの場合は`:global()`を使用
   - スコープ付きスタイルの制限を確認