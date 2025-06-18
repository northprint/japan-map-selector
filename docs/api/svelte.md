# Svelte コンポーネント API

`JapanMapSelectorSvelte`コンポーネントのAPIリファレンスです。

## インポート

```javascript
import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
```

## Props

### 必須Props

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `prefectureDataUrl` | `string` | 都道府県データのJSONファイルURL |
| `municipalityDataUrl` | `string` | 市区町村データのJSONファイルURL |

### オプションProps

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|------------|------|
| `width` | `number` | `800` | 地図の幅（ピクセル） |
| `height` | `number` | `600` | 地図の高さ（ピクセル） |
| `theme` | `string \| ColorTheme` | `'default'` | カラーテーマ |
| `selectedPrefectureCode` | `string` | - | 初期選択都道府県コード |
| `selectedMunicipalityCode` | `string` | - | 初期選択市区町村コード |
| `selectablePrefectures` | `string[]` | - | 選択可能な都道府県コードの配列 |
| `disabledPrefectureFill` | `string` | `'#cccccc'` | 選択不可都道府県の塗りつぶし色 |
| `disabledPrefectureStroke` | `string` | `'#999999'` | 選択不可都道府県の枠線色 |
| `simplificationLevel` | `'original' \| 'high' \| 'medium' \| 'low' \| 'ultra-low'` | `'original'` | ポリゴンの簡略化レベル |
| `showAttribution` | `boolean` | `true` | 出典表示の有無 |
| `attributionOptions` | `AttributionOptions` | - | 出典表示のオプション |

### カラーカスタマイズProps

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `prefectureColor` | `string` | 都道府県の塗りつぶし色 |
| `prefectureHoverColor` | `string` | 都道府県のホバー色 |
| `municipalityColor` | `string` | 市区町村の塗りつぶし色 |
| `municipalityHoverColor` | `string` | 市区町村のホバー色 |

## イベント

Svelteコンポーネントは以下のカスタムイベントを発火します：

| イベント名 | 説明 | イベント詳細 |
|-----------|------|--------------|
| `prefectureSelect` | 都道府県選択時 | `event.detail: Prefecture` |
| `municipalitySelect` | 市区町村選択時 | `event.detail: Municipality` |
| `initialized` | 初期化完了時 | なし |
| `themeChanged` | テーマ変更時 | `event.detail: ColorTheme` |

## メソッド（bind:this経由）

コンポーネントのインスタンスを通じて以下のメソッドにアクセスできます：

```svelte
<script>
  let mapComponent;
  
  // 使用例
  function reset() {
    mapComponent?.resetView();
  }
</script>

<JapanMapSelectorSvelte
  bind:this={mapComponent}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```

### 利用可能なメソッド

| メソッド | 説明 | パラメータ |
|----------|------|------------|
| `resetView()` | 日本全体ビューに戻る | なし |
| `selectPrefecture(code)` | 都道府県を選択 | `code: string` |
| `selectMunicipality(code)` | 市区町村を選択 | `code: string` |
| `setTheme(theme)` | テーマを変更 | `theme: string \| ColorTheme` |
| `setDeformMode(mode, gridSize)` | ディフォルメモードを設定 | `mode: 'none' \| 'grid' \| 'hexagon'`, `gridSize?: number` |
| `getPrefectures()` | 都道府県一覧を取得 | なし |
| `getSelectedMunicipalities()` | 選択中の都道府県の市区町村一覧を取得 | なし |
| `getState()` | 現在の状態を取得 | なし |

## スロット

このコンポーネントは現在スロットをサポートしていません。

## 使用例

### 基本的な使用

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  function handlePrefectureSelect(event) {
    console.log('選択された都道府県:', event.detail.name);
  }
  
  function handleMunicipalitySelect(event) {
    console.log('選択された市区町村:', event.detail.name);
  }
</script>

<JapanMapSelectorSvelte
  width={800}
  height={600}
  theme="colorful"
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
  on:prefectureSelect={handlePrefectureSelect}
  on:municipalitySelect={handleMunicipalitySelect}
/>
```

### リアクティブなプロパティ

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let currentTheme = 'default';
  let simplificationLevel = 'medium';
  
  $: console.log('テーマが変更されました:', currentTheme);
</script>

<label>
  テーマ:
  <select bind:value={currentTheme}>
    <option value="default">Default</option>
    <option value="dark">Dark</option>
    <option value="colorful">Colorful</option>
  </select>
</label>

<JapanMapSelectorSvelte
  theme={currentTheme}
  simplificationLevel={simplificationLevel}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```

### インスタンスメソッドの使用

```svelte
<script>
  import { JapanMapSelectorSvelte } from 'japan-map-selector/svelte';
  
  let map;
  let searchQuery = '';
  
  function searchAndSelect() {
    if (!map || !searchQuery) return;
    
    const prefectures = map.getPrefectures();
    const found = prefectures.find(p => 
      p.name.includes(searchQuery)
    );
    
    if (found) {
      map.selectPrefecture(found.code);
    }
  }
  
  function applyDeformation(mode) {
    map?.setDeformMode(mode, mode === 'grid' ? 0.1 : 0.15);
  }
</script>

<div class="controls">
  <input 
    bind:value={searchQuery}
    placeholder="都道府県を検索..."
  />
  <button on:click={searchAndSelect}>検索</button>
  <button on:click={() => map?.resetView()}>リセット</button>
  
  <div class="deform-buttons">
    <button on:click={() => applyDeformation('none')}>通常</button>
    <button on:click={() => applyDeformation('grid')}>グリッド</button>
    <button on:click={() => applyDeformation('hexagon')}>六角形</button>
  </div>
</div>

<JapanMapSelectorSvelte
  bind:this={map}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```

### カスタムテーマ

```svelte
<script>
  const oceanTheme = {
    name: 'ocean',
    prefectureFill: '#0077be',
    prefectureStroke: '#005a9e',
    prefectureHoverFill: '#0099cc',
    prefectureSelectedFill: '#00bfff',
    municipalityFill: '#87ceeb',
    municipalityStroke: '#4682b4',
    municipalityHoverFill: '#add8e6',
    municipalitySelectedFill: '#b0e0e6',
    backgroundColor: '#f0f8ff',
    strokeWidth: 1.5
  };
</script>

<JapanMapSelectorSvelte
  theme={oceanTheme}
  prefectureDataUrl="/data/prefectures.json"
  municipalityDataUrl="/data/municipalities.json"
/>
```

## SvelteKit での使用

### クライアントサイドレンダリング

```javascript
// +page.js
export const ssr = false;
```

### 条件付きレンダリング

```svelte
<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let JapanMapSelectorSvelte;
  
  onMount(async () => {
    if (browser) {
      const module = await import('japan-map-selector/svelte');
      JapanMapSelectorSvelte = module.JapanMapSelectorSvelte;
    }
  });
</script>

{#if JapanMapSelectorSvelte}
  <svelte:component
    this={JapanMapSelectorSvelte}
    prefectureDataUrl="/data/prefectures.json"
    municipalityDataUrl="/data/municipalities.json"
  />
{:else}
  <div>地図を読み込み中...</div>
{/if}
```