import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 精度レベル
const precisionLevels = ['original', 'high', 'medium', 'low', 'ultra-low'];

// 都道府県コードと名前のマッピング
const prefectureNames = {
  '01': '北海道', '02': '青森県', '03': '岩手県', '04': '宮城県', '05': '秋田県',
  '06': '山形県', '07': '福島県', '08': '茨城県', '09': '栃木県', '10': '群馬県',
  '11': '埼玉県', '12': '千葉県', '13': '東京都', '14': '神奈川県', '15': '新潟県',
  '16': '富山県', '17': '石川県', '18': '福井県', '19': '山梨県', '20': '長野県',
  '21': '岐阜県', '22': '静岡県', '23': '愛知県', '24': '三重県', '25': '滋賀県',
  '26': '京都府', '27': '大阪府', '28': '兵庫県', '29': '奈良県', '30': '和歌山県',
  '31': '鳥取県', '32': '島根県', '33': '岡山県', '34': '広島県', '35': '山口県',
  '36': '徳島県', '37': '香川県', '38': '愛媛県', '39': '高知県', '40': '福岡県',
  '41': '佐賀県', '42': '長崎県', '43': '熊本県', '44': '大分県', '45': '宮崎県',
  '46': '鹿児島県', '47': '沖縄県'
};

// 進捗表示
function showProgress(current, total, message) {
  const percentage = Math.round((current / total) * 100);
  process.stdout.write(`\r[${percentage}%] ${message}`);
}

// ディレクトリを再帰的に作成
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// GeoJSON feature collectionを作成
function createFeatureCollection(features) {
  return {
    type: 'FeatureCollection',
    features: features
  };
}

// メイン処理
async function splitMunicipalityData() {
  console.log('市区町村データの分割を開始します...\n');

  // インデックス情報を格納
  const indexData = {
    prefectures: {},
    generated: new Date().toISOString(),
    totalSize: {
      original: 0,
      compressed: 0
    }
  };

  let totalOperations = precisionLevels.length * 47;
  let currentOperation = 0;

  for (const precision of precisionLevels) {
    const inputFile = path.join(__dirname, '..', 'src', 'data', 'simplified', `municipalities-${precision}.geojson`);
    
    // ファイルが存在しない場合はスキップ
    if (!fs.existsSync(inputFile)) {
      console.log(`\n警告: ${inputFile} が見つかりません。スキップします。`);
      totalOperations -= 47;
      continue;
    }

    console.log(`\n${precision}精度のデータを処理中...`);

    // データを読み込み
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const features = data.features;

    // 都道府県ごとにグループ化
    const prefectureGroups = {};
    features.forEach(feature => {
      const code = feature.properties.N03_007?.substring(0, 2);
      if (!prefectureGroups[code]) {
        prefectureGroups[code] = [];
      }
      prefectureGroups[code].push(feature);
    });

    // 各都道府県のデータを保存
    for (const [prefCode, municipalityFeatures] of Object.entries(prefectureGroups)) {
      currentOperation++;
      
      const prefName = prefectureNames[prefCode] || `都道府県${prefCode}`;
      showProgress(currentOperation, totalOperations, `${prefName} - ${precision}精度`);

      // 出力ディレクトリを作成
      const outputDir = path.join(__dirname, '..', 'src', 'data', 'prefectures', prefCode);
      ensureDir(outputDir);

      // GeoJSONを作成
      const geoJson = createFeatureCollection(municipalityFeatures);
      const outputFile = path.join(outputDir, `municipalities-${precision}.geojson`);
      
      // ファイルに書き込み（圧縮）
      const jsonStr = JSON.stringify(geoJson);
      fs.writeFileSync(outputFile, jsonStr);

      // インデックスに追加
      if (!indexData.prefectures[prefCode]) {
        indexData.prefectures[prefCode] = {
          name: prefName,
          municipalityCount: municipalityFeatures.length,
          files: {}
        };
      }

      const fileSize = Buffer.byteLength(jsonStr, 'utf8');
      indexData.prefectures[prefCode].files[precision] = {
        path: `prefectures/${prefCode}/municipalities-${precision}.geojson`,
        size: fileSize,
        features: municipalityFeatures.length
      };

      indexData.totalSize.original += fileSize;
    }
  }

  console.log('\n\nインデックスファイルを作成中...');

  // インデックスファイルを保存
  const indexFile = path.join(__dirname, '..', 'src', 'data', 'prefecture-index.json');
  fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));

  // 統計情報を表示
  console.log('\n=== 分割完了 ===');
  console.log(`処理した都道府県数: ${Object.keys(indexData.prefectures).length}`);
  console.log(`総ファイルサイズ: ${(indexData.totalSize.original / 1024 / 1024).toFixed(2)}MB`);
  console.log('\n都道府県別の市区町村数:');
  
  Object.entries(indexData.prefectures)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([code, info]) => {
      console.log(`  ${code}: ${info.name} - ${info.municipalityCount}市区町村`);
    });

  console.log('\n✨ データの分割が完了しました！');
  console.log(`インデックスファイル: ${indexFile}`);
}

// スクリプトを実行
splitMunicipalityData().catch(console.error);