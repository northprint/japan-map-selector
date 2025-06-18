# ヒーロー画像の作成手順

ドキュメントサイトのトップページに表示するヒーロー画像（map-preview.png）を作成する手順です。

## 方法1: screenshot-demo.htmlを使用

1. **HTTPサーバーを起動**
   ```bash
   python3 -m http.server 8000
   ```

2. **ブラウザでアクセス**
   ```
   http://localhost:8000/screenshot-demo.html
   ```

3. **スクリーンショットを撮影**
   - ブラウザの開発者ツール（F12）を開く
   - デバイスツールバーをクリック（レスポンシブモード）
   - サイズを `1200 x 800` に設定
   - スクリーンショットボタンをクリック

4. **画像を保存**
   ```bash
   # ダウンロードした画像を移動
   mv ~/Downloads/screenshot.png docs/public/map-preview.png
   ```

## 方法2: 実際のdemo.htmlを使用

1. **demo.htmlを開く**
   ```bash
   open http://localhost:8000/demo.html
   ```

2. **最適な状態に設定**
   - テーマ: Colorful
   - 簡略化レベル: Medium
   - 関東地方または東京都を選択
   - ズームレベルを調整

3. **スクリーンショットツールを使用**
   - macOS: Cmd + Shift + 4 でエリア選択
   - Windows: Windows + Shift + S でスクリーン切り取り
   - または、ブラウザの拡張機能を使用

## 方法3: macOSのスクリーンショットコマンド

```bash
# screenshot-demo.htmlを開いた状態で
# 5秒後にスクリーンショットを撮影
sleep 5 && screencapture -x -R0,0,1200,800 docs/public/map-preview.png
```

## 画像の最適化

```bash
# インストール（必要な場合）
brew install pngquant

# PNGを最適化
pngquant --quality=65-80 docs/public/map-preview.png
mv docs/public/map-preview-fs8.png docs/public/map-preview.png

# ファイルサイズを確認
ls -lh docs/public/map-preview.png
```

## 推奨される画像の内容

- 📍 関東地方が選択された状態
- 🎨 Colorfulテーマを使用
- 📊 情報パネルに選択情報が表示されている
- 🗾 沖縄県の枠が左上に表示されている
- ✨ きれいなグラデーション背景

## チェックリスト

- [ ] 画像サイズは1200x800px以上
- [ ] ファイルサイズは500KB以下
- [ ] 鮮明で読みやすい
- [ ] ブランドカラーが映えている
- [ ] 機能が分かりやすく表示されている