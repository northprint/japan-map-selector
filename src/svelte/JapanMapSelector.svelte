<script lang="ts">
  // Svelteコンポーネント
  
  import { onMount, onDestroy } from 'svelte';
  import { JapanMapSelector as CoreSelector } from '../core/japan-map-selector';
  import type { 
    JapanMapSelectorProps, 
    MapState, 
    Prefecture, 
    Municipality 
  } from '../types';

  // プロパティ
  export let prefectureDataUrl: string;
  export let municipalityDataUrl: string;
  export let width: number = 800;
  export let height: number = 600;
  export let prefectureColor: string = '#e0e0e0';
  export let prefectureHoverColor: string = '#c0c0c0';
  export let municipalityColor: string = '#f0f0f0';
  export let municipalityHoverColor: string = '#d0d0d0';
  export let onPrefectureSelect: ((prefecture: Prefecture) => void) | undefined = undefined;
  export let onMunicipalitySelect: ((municipality: Municipality) => void) | undefined = undefined;
  
  // 内部状態
  let selector: CoreSelector | null = null;
  let state: MapState | null = null;
  let isLoading = true;
  let error: string | null = null;
  let prefectures: Prefecture[] = [];
  let municipalities: Municipality[] = [];

  // 初期化
  onMount(async () => {
    const props: JapanMapSelectorProps = {
      width,
      height,
      prefectureColor,
      prefectureHoverColor,
      municipalityColor,
      municipalityHoverColor,
      onPrefectureSelect,
      onMunicipalitySelect
    };
    
    selector = new CoreSelector(props);

    // 状態変更のリスナー設定
    selector.on('stateChanged', (newState: MapState) => {
      state = { ...newState };
      if (state.selectedPrefecture) {
        municipalities = selector!.getSelectedMunicipalities();
      } else {
        municipalities = [];
      }
    });

    try {
      await selector.initialize(prefectureDataUrl, municipalityDataUrl);
      prefectures = selector.getPrefectures();
      state = selector.getState();
      isLoading = false;
    } catch (err) {
      error = err.message;
      isLoading = false;
    }
  });

  // クリーンアップ
  onDestroy(() => {
    selector = null;
  });

  // 都道府県クリック
  function handlePrefectureClick(prefecture: Prefecture) {
    selector?.selectPrefecture(prefecture.code);
  }

  // 市区町村クリック
  function handleMunicipalityClick(municipality: Municipality) {
    selector?.selectMunicipality(municipality.code);
  }

  // 都道府県ホバー
  function handlePrefectureMouseEnter(prefecture: Prefecture) {
    selector?.hoverPrefecture(prefecture.code);
  }

  function handlePrefectureMouseLeave() {
    selector?.hoverPrefecture(null);
  }

  // 市区町村ホバー
  function handleMunicipalityMouseEnter(municipality: Municipality) {
    selector?.hoverMunicipality(municipality.code);
  }

  function handleMunicipalityMouseLeave() {
    selector?.hoverMunicipality(null);
  }

  // 戻るボタン
  function handleBackClick() {
    selector?.resetView();
  }
</script>

<div class="japan-map-selector">
  {#if isLoading}
    <div class="loading">読み込み中...</div>
  {:else if error}
    <div class="error">エラー: {error}</div>
  {:else if selector && state}
    {#if state.selectedPrefecture}
      <button 
        class="back-button" 
        on:click={handleBackClick}
      >
        ← 全国に戻る
      </button>
    {/if}
    
    <svg
      {width}
      {height}
      viewBox={state.viewBox}
      class="map-svg"
    >
      <!-- 都道府県表示（全国ビュー時） -->
      {#if !state.selectedPrefecture}
        {#each prefectures as prefecture}
          <path
            d={selector.getPrefecturePath(prefecture)}
            fill={state.hoveredPrefecture?.code === prefecture.code
              ? prefectureHoverColor
              : prefectureColor}
            stroke="#999"
            stroke-width="0.5"
            class="prefecture-path"
            on:click={() => handlePrefectureClick(prefecture)}
            on:mouseenter={() => handlePrefectureMouseEnter(prefecture)}
            on:mouseleave={handlePrefectureMouseLeave}
          >
            <title>{prefecture.name}</title>
          </path>
        {/each}
      {/if}

      <!-- 市区町村表示（都道府県選択時） -->
      {#if state.selectedPrefecture}
        {#each municipalities as municipality}
          <path
            d={selector.getMunicipalityPath(municipality)}
            fill={state.hoveredMunicipality?.code === municipality.code
              ? municipalityHoverColor
              : municipalityColor}
            stroke="#aaa"
            stroke-width="0.5"
            class="municipality-path"
            on:click={() => handleMunicipalityClick(municipality)}
            on:mouseenter={() => handleMunicipalityMouseEnter(municipality)}
            on:mouseleave={handleMunicipalityMouseLeave}
          >
            <title>{municipality.name}</title>
          </path>
        {/each}
      {/if}
    </svg>

    <!-- ホバー情報表示 -->
    {#if state.hoveredPrefecture || state.hoveredMunicipality}
      <div class="hover-info">
        {#if state.hoveredPrefecture && !state.selectedPrefecture}
          <div>{state.hoveredPrefecture.name}</div>
        {/if}
        {#if state.hoveredMunicipality}
          <div>{state.hoveredMunicipality.name}</div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .japan-map-selector {
    position: relative;
    display: inline-block;
  }

  .loading, .error {
    padding: 20px;
    text-align: center;
  }

  .map-svg {
    background: #f8f8f8;
  }

  .prefecture-path, .municipality-path {
    cursor: pointer;
    transition: fill 0.2s ease;
  }

  .back-button {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .back-button:hover {
    background: #f0f0f0;
  }

  .hover-info {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    pointer-events: none;
  }
</style>