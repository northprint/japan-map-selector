# 選択時のアクション実装例

市区町村や都道府県を選択した際に、様々なアクションを実行する実装例を紹介します。

## 基本的なコールバック

### バニラJavaScript

```javascript
import { JapanMapSelector } from 'japan-map-selector';

const map = new JapanMapSelector({
  width: 800,
  height: 600,
  onPrefectureSelect: (prefecture) => {
    console.log('都道府県選択:', prefecture);
  },
  onMunicipalitySelect: (municipality) => {
    console.log('市区町村選択:', municipality);
    // ここで任意の処理を実行
  }
});
```

### React

```jsx
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithActions() {
  const handleMunicipalitySelect = (municipality) => {
    // 任意の処理を実行
    console.log(`${municipality.name}が選択されました`);
  };

  return (
    <JapanMapSelectorReact
      width={800}
      height={600}
      onMunicipalitySelect={handleMunicipalitySelect}
      prefectureDataUrl="/data/prefectures.json"
      municipalityDataUrl="/data/municipalities.json"
    />
  );
}
```

## URLを開く・API呼び出し

### 外部URLを新しいタブで開く

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // Wikipediaを開く例
    const searchUrl = `https://ja.wikipedia.org/wiki/${encodeURIComponent(municipality.name)}`;
    window.open(searchUrl, '_blank');
  }
});
```

### APIを呼び出してデータを取得

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: async (municipality) => {
    try {
      // 市区町村コードを使ってAPIを呼び出す
      const response = await fetch(`/api/municipalities/${municipality.code}`);
      const data = await response.json();
      
      // 取得したデータを表示
      document.getElementById('info-panel').innerHTML = `
        <h3>${municipality.name}</h3>
        <p>人口: ${data.population.toLocaleString()}人</p>
        <p>面積: ${data.area}km²</p>
        <p>世帯数: ${data.households.toLocaleString()}世帯</p>
      `;
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    }
  }
});
```

## ページ遷移

### 同じウィンドウでページ遷移

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // 詳細ページに遷移
    window.location.href = `/municipalities/${municipality.code}`;
  }
});
```

### React Router を使用した遷移

```jsx
import { useNavigate } from 'react-router-dom';
import { JapanMapSelectorReact } from 'japan-map-selector/react';

function MapWithRouting() {
  const navigate = useNavigate();

  const handleMunicipalitySelect = (municipality) => {
    // React Routerでページ遷移
    navigate(`/municipality/${municipality.code}`, {
      state: { name: municipality.name }
    });
  };

  return (
    <JapanMapSelectorReact
      onMunicipalitySelect={handleMunicipalitySelect}
      prefectureDataUrl="/data/prefectures.json"
      municipalityDataUrl="/data/municipalities.json"
    />
  );
}
```

## モーダル・ポップアップ表示

### 情報モーダルを表示

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // モーダルを表示
    const modal = document.getElementById('info-modal');
    const modalContent = document.getElementById('modal-content');
    
    modalContent.innerHTML = `
      <h2>${municipality.name}</h2>
      <p>市区町村コード: ${municipality.code}</p>
      <p>都道府県コード: ${municipality.prefectureCode}</p>
      <button onclick="closeModal()">閉じる</button>
    `;
    
    modal.style.display = 'block';
  }
});

// モーダルを閉じる関数
function closeModal() {
  document.getElementById('info-modal').style.display = 'none';
}
```

## データの送信

### フォームデータとして送信

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // 隠しフィールドに値を設定
    document.getElementById('selected-municipality').value = municipality.code;
    document.getElementById('municipality-name').value = municipality.name;
    
    // 必要に応じてフォームを自動送信
    // document.getElementById('location-form').submit();
  }
});
```

### Ajax/Fetchで送信

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: async (municipality) => {
    const data = {
      municipalityCode: municipality.code,
      municipalityName: municipality.name,
      prefectureCode: municipality.prefectureCode,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/select-municipality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('選択が保存されました');
      }
    } catch (error) {
      console.error('エラー:', error);
    }
  }
});
```

## 複数の処理を組み合わせる

### 選択履歴を保持しながら処理

```javascript
class MapWithHistory {
  constructor() {
    this.selectionHistory = [];
    
    this.map = new JapanMapSelector({
      onMunicipalitySelect: (municipality) => {
        // 履歴に追加
        this.addToHistory(municipality);
        
        // データを取得
        this.fetchMunicipalityData(municipality);
        
        // UIを更新
        this.updateUI(municipality);
      }
    });
  }

  addToHistory(municipality) {
    this.selectionHistory.push({
      code: municipality.code,
      name: municipality.name,
      timestamp: new Date()
    });
    
    // 最大10件まで保持
    if (this.selectionHistory.length > 10) {
      this.selectionHistory.shift();
    }
  }

  async fetchMunicipalityData(municipality) {
    // APIからデータを取得
    const response = await fetch(`/api/data/${municipality.code}`);
    const data = await response.json();
    return data;
  }

  updateUI(municipality) {
    // 選択された市区町村の情報を表示
    document.getElementById('current-selection').textContent = municipality.name;
    
    // 履歴を表示
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = this.selectionHistory
      .map(item => `<li>${item.name} - ${item.timestamp.toLocaleTimeString()}</li>`)
      .join('');
  }
}
```

## カスタムイベントの発火

### グローバルなイベントシステムと連携

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // カスタムイベントを発火
    const event = new CustomEvent('municipalitySelected', {
      detail: {
        code: municipality.code,
        name: municipality.name,
        prefectureCode: municipality.prefectureCode,
        feature: municipality.feature
      }
    });
    
    document.dispatchEvent(event);
  }
});

// 他の場所でイベントをリッスン
document.addEventListener('municipalitySelected', (event) => {
  console.log('市区町村が選択されました:', event.detail);
  // ここで任意の処理を実行
});
```

## Google Analytics / GTMとの連携

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: (municipality) => {
    // Google Analytics 4 にイベントを送信
    if (typeof gtag !== 'undefined') {
      gtag('event', 'select_municipality', {
        municipality_code: municipality.code,
        municipality_name: municipality.name,
        prefecture_code: municipality.prefectureCode
      });
    }
    
    // Google Tag Manager にデータを送信
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'municipalitySelected',
        municipalityCode: municipality.code,
        municipalityName: municipality.name
      });
    }
  }
});
```

## エラーハンドリング

```javascript
const map = new JapanMapSelector({
  onMunicipalitySelect: async (municipality) => {
    // ローディング表示
    showLoadingSpinner();
    
    try {
      // API呼び出し
      const response = await fetch(`/api/municipality/${municipality.code}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      displayMunicipalityInfo(data);
      
    } catch (error) {
      console.error('Error:', error);
      
      // エラーメッセージを表示
      showErrorMessage('データの取得に失敗しました。後でもう一度お試しください。');
      
    } finally {
      // ローディング非表示
      hideLoadingSpinner();
    }
  }
});
```