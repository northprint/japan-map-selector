# GitHub Pages Setup Guide

GitHub Pagesでドキュメントサイトを公開するための設定手順です。

## 1. GitHub Pagesを有効化

1. GitHubリポジトリ（https://github.com/northprint/japan-map-selector）にアクセス
2. **Settings** タブをクリック
3. 左側のサイドバーから **Pages** を選択
4. **Source** セクションで以下を設定：
   - Source: `GitHub Actions` を選択

## 2. ワークフローの実行

GitHub Pagesを有効化した後、以下のいずれかの方法でワークフローを実行します：

### 方法1: 手動実行
1. **Actions** タブをクリック
2. 左側のワークフロー一覧から `Deploy Documentation` を選択
3. `Run workflow` ボタンをクリック
4. `main` ブランチを選択して `Run workflow` をクリック

### 方法2: コードの変更をプッシュ
```bash
# 任意の変更を加えてコミット・プッシュ
git add .
git commit -m "Trigger documentation deployment"
git push origin main
```

## 3. デプロイの確認

1. **Actions** タブでワークフローの実行状況を確認
2. 緑色のチェックマークが表示されたら完了
3. 以下のURLでドキュメントにアクセス：
   - https://northprint.github.io/japan-map-selector/

## トラブルシューティング

### "Error: Creating Pages deployment failed" エラーが出る場合
- GitHub Pagesが有効化されているか確認
- Settings → Pages → Source が `GitHub Actions` に設定されているか確認

### ページが404エラーになる場合
- デプロイが完了するまで数分待つ
- ブラウザのキャッシュをクリア
- URLが正しいか確認（/japan-map-selector/ が含まれているか）

### ビルドエラーが発生する場合
- Actions タブでエラーログを確認
- `npm ci` でローカルでビルドが成功するか確認
- Node.jsのバージョンが20以上か確認

## 公開されるコンテンツ

- `/` - ドキュメントトップページ
- `/guide/` - 使い方ガイド
- `/api/` - APIリファレンス
- `/examples/` - 使用例
- `/demo` - インタラクティブデモ

## メンテナンス

### ドキュメントの更新
```bash
# ローカルでプレビュー
npm run docs:dev

# 変更をコミット・プッシュ
git add docs/
git commit -m "Update documentation"
git push origin main
```

### 手動デプロイ
GitHub Actions から `Deploy Documentation` ワークフローを手動実行できます。