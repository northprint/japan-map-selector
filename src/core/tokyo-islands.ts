// 東京都の離島市区町村リスト
export const TOKYO_ISLANDS = [
  "小笠原村",
  "大島町",
  "利島村",
  "新島村",
  "神津島村",
  "三宅村",
  "御蔵島村",
  "八丈町",
  "青ヶ島村"
];

// 市区町村が東京都の離島かどうかを判定
export function isTokyoIsland(municipalityName: string): boolean {
  return TOKYO_ISLANDS.includes(municipalityName);
}

// 東京都の離島の市区町村コード
export const TOKYO_ISLAND_CODES = [
  "13361", // 大島町
  "13362", // 利島村
  "13363", // 新島村
  "13364", // 神津島村
  "13381", // 三宅村
  "13382", // 御蔵島村
  "13401", // 八丈町
  "13402", // 青ヶ島村
  "13421"  // 小笠原村
];

// 市区町村コードから離島かどうかを判定
export function isTokyoIslandByCode(municipalityCode: string): boolean {
  return TOKYO_ISLAND_CODES.includes(municipalityCode);
}