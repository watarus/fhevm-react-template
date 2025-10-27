# Video Production Guide - Universal FHEVM SDK

実際にビデオを制作するための実践的なガイドです。

---

## 🎬 推奨方法：3つのアプローチ

### 方法1: Loom（最も簡単・推奨）⭐

**メリット**:
- 🚀 超高速（30分で完成可能）
- 🎯 ワンテイク録画＋自動編集
- 💬 自動字幕生成
- 🔗 即座にシェア可能なURL
- 💰 無料プラン利用可能

**手順**:

1. **準備（5分）**
   ```bash
   # Loomをインストール
   # https://www.loom.com/download

   # 開発サーバー起動
   cd /Users/zdzd/src/github.com/watarus/fhevm-react-template
   pnpm --filter site dev

   # ブラウザでlocalhost:3000を開く
   # MetaMaskを設定（Hardhat network）
   ```

2. **録画（15-20分）**
   - Loom起動 → "Screen + Camera" 選択
   - VIDEO_SCRIPT.mdを別モニター/タブレットで表示
   - 録画開始
   - スクリプトに沿って実演
   - 間違えても大丈夫（後で編集可能）

3. **編集（5-10分）**
   - Loomの自動編集機能:
     - 無音部分の自動削除
     - "um", "uh"の自動カット
     - クリック音の追加
   - マニュアル編集:
     - 不要部分をトリム
     - チャプターマーカー追加
     - CTA（Call-to-Action）ボタン追加

4. **エクスポート**
   - MP4としてダウンロード
   - YouTubeに直接アップロード
   - または、シェアリンクをそのまま使用

**推奨設定**:
```
解像度: 1080p
フレームレート: 30fps
マイク: 内蔵マイクでOK（ノイズキャンセリング機能あり）
カメラ: オプション（顔出しは任意）
```

**Loomの便利機能**:
- 自動字幕生成（多言語対応）
- コメント機能（タイムスタンプ付き）
- 視聴分析（どこで離脱したか確認）
- 簡単な編集UI

---

### 方法2: OBS Studio + DaVinci Resolve（プロフェッショナル）

**メリット**:
- 🎨 完全なコントロール
- 🎬 プロレベルの仕上がり
- 🔧 高度な編集可能
- 💰 完全無料

**手順**:

1. **ツールインストール（10分）**
   ```bash
   # OBS Studio（録画）
   brew install --cask obs

   # DaVinci Resolve（編集）
   # https://www.blackmagicdesign.com/products/davinciresolve
   # 無料版で十分
   ```

2. **OBS設定（15分）**
   ```
   Settings → Output:
   - Recording Quality: High
   - Recording Format: mp4
   - Encoder: x264
   - Rate Control: CBR
   - Bitrate: 8000 Kbps

   Settings → Video:
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30

   Settings → Audio:
   - Sample Rate: 48kHz
   - Channels: Stereo
   ```

3. **シーン構成**
   ```
   Scene 1: Full Screen
   - ソース: Display Capture (localhost:3000)

   Scene 2: Code + Screen
   - ソース1: Display Capture (50%)
   - ソース2: Window Capture (VSCode, 50%)

   Scene 3: GitHub
   - ソース: Browser (GitHub repository)

   Scene 4: Outro
   - ソース: Image (title card)
   ```

4. **録画（30-40分）**
   - VIDEO_SCRIPT.mdをプロンプター代わりに表示
   - シーンごとに録画（ミスしても再録画しやすい）
   - 各シーンを別ファイルで保存

5. **DaVinci Resolve編集（1-2時間）**
   ```
   タイムライン構成:
   1. イントロ（5秒タイトルカード）
   2. 各シーンをカット＆つなぎ
   3. トランジション追加
   4. テキストオーバーレイ（コードスニペット等）
   5. BGM追加（著作権フリー音楽）
   6. カラーグレーディング
   7. アウトロ（リンク表示）
   ```

6. **エクスポート**
   ```
   Format: MP4
   Codec: H.264
   Resolution: 1920x1080
   Frame rate: 30fps
   Quality: YouTube 1080p preset
   ```

**プロTips**:
- マルチカメラ録画（画面＋自分の顔）
- 高品質マイク使用（Blue Yeti等）
- 照明設定（リングライト推奨）
- B-roll素材（コードクローズアップ等）

---

### 方法3: 自動化スクリプト＋AI編集（最新・実験的）

**メリット**:
- 🤖 大部分を自動化
- ⚡ 超高速（録画なし）
- 🎯 一貫性のある品質
- 🔄 簡単に再生成可能

**手順**:

1. **ツールインストール**
   ```bash
   # Playwright（ブラウザ自動操作）
   npm install -D @playwright/test

   # FFmpeg（動画処理）
   brew install ffmpeg

   # ElevenLabs CLI（AIナレーション、オプション）
   npm install -g elevenlabs
   ```

2. **スクリプト作成**
   ```typescript
   // record-demo.ts
   import { chromium } from '@playwright/test';

   async function recordDemo() {
     const browser = await chromium.launch({
       headless: false,
       args: ['--window-size=1920,1080']
     });

     const context = await browser.newContext({
       viewport: { width: 1920, height: 1080 },
       recordVideo: {
         dir: './videos',
         size: { width: 1920, height: 1080 }
       }
     });

     const page = await context.newPage();

     // Scene 1: Homepage
     await page.goto('http://localhost:3000');
     await page.waitForTimeout(3000);

     // Scene 2: Connect Wallet
     await page.click('text=Connect Wallet');
     await page.waitForTimeout(2000);
     // MetaMask popup handling...

     // Scene 3: Decrypt
     await page.click('text=Decrypt Counter');
     await page.waitForTimeout(5000);

     // ... more scenes

     await context.close();
     await browser.close();
   }

   recordDemo();
   ```

3. **AI ナレーション生成**
   ```bash
   # VIDEO_SCRIPT.mdからナレーション抽出
   # ElevenLabsでAI音声生成
   elevenlabs text-to-speech \
     --text "$(cat narration.txt)" \
     --voice "Adam" \
     --output narration.mp3
   ```

4. **動画合成**
   ```bash
   # FFmpegで画面録画＋ナレーション合成
   ffmpeg -i screen-recording.mp4 \
          -i narration.mp3 \
          -c:v copy \
          -c:a aac \
          -map 0:v:0 \
          -map 1:a:0 \
          output.mp4
   ```

5. **AI編集（Descript等）**
   - 録画をDescriptにアップロード
   - 自動文字起こし
   - テキスト編集で動画編集
   - "um", "uh"を自動削除
   - 無音部分を自動カット

**推奨ツール**:
- Descript - テキストベース編集
- Remotion - コードで動画生成
- Manim - 数学的アニメーション
- Motion Canvas - プログラマブルアニメーション

---

## 🎯 実践：最速でプロ品質を作る方法

### 推奨フロー（Loom + Canva）⭐⭐⭐

**総所要時間**: 1時間

```
準備（10分）
  ↓
Loom録画（20分）
  ↓
Loom簡易編集（5分）
  ↓
Canvaでタイトルカード作成（10分）
  ↓
最終チェック（5分）
  ↓
YouTube アップロード（10分）
```

### ステップ詳細

#### 1. 準備（10分）

```bash
# 開発サーバー起動
pnpm --filter site dev

# 新しいターミナルで
# MetaMaskテストアカウント設定
# - Hardhat network追加
# - テストアカウントインポート

# ブラウザタブ準備
# Tab 1: localhost:3000
# Tab 2: GitHub repository
# Tab 3: packages/fhevm-sdk/README.md
# Tab 4: VSCode (コード例)
```

**録画環境チェックリスト**:
- [ ] 画面解像度 1920x1080以上
- [ ] 不要な通知オフ
- [ ] デスクトップ整理（関係ないアイコン非表示）
- [ ] ブラウザブックマークバー非表示
- [ ] ダークモード統一（推奨）
- [ ] フォントサイズ拡大（コード見やすく）

#### 2. Loom録画（20分）

**録画設定**:
```
Screen: Full Desktop
Camera: Optional（顔出し任意）
Microphone: On
Quality: 1080p
```

**録画のコツ**:
1. **最初の5秒は無音で待つ** - 編集しやすい
2. **スローペースで話す** - 早口は禁物
3. **間違えても続行** - 後でカット可能
4. **重要なアクションは2秒待つ** - 画面切り替わりを待つ
5. **マウスカーソルに注意** - 大きくゆっくり動かす

**VIDEO_SCRIPT.mdのシーン順に録画**:
```
✓ Intro - GitHubリポジトリ表示
✓ Problem/Solution - コード比較
✓ Architecture - README図を表示
✓ Live Demo - localhost:3000で実演
✓ Code Comparison - スクロールで比較
✓ Vue Support - コードを表示
✓ Technical - ターミナルでビルド実行
✓ Closing - リンク表示
```

#### 3. Loom編集（5分）

**自動編集機能を使う**:
- [ ] Remove filler words（"um", "uh"削除）
- [ ] Remove silence（長い無音削除）
- [ ] Add chapters（チャプター追加）

**マニュアル編集**:
```
00:00-00:05 イントロ（必要に応じてカット）
00:05-01:20 Problem & Solution
01:20-02:50 Architecture & Demo
...
06:30-07:00 Outro
```

**追加要素**:
- [ ] タイトルカード（最初5秒）
- [ ] CTAボタン（最後に「GitHub」「Live Demo」リンク）
- [ ] チャプターマーカー（15シーン分）

#### 4. Canvaでタイトルカード（10分）

**テンプレート使用**:
```
Canvaにログイン
→ "YouTube Thumbnail" テンプレート選択
→ テキスト変更:
   "Universal FHEVM SDK v0.1.0"
   "Multi-Framework Confidential dApps"
→ ロゴ追加（Zama logo）
→ エクスポート: PNG, 1920x1080
```

**アウトロスライド**:
```
テキスト:
- GitHub: [your-repo-url]
- Live Demo: [your-vercel-url]
- Docs: [link]

Built with ❤️ for Zama
```

#### 5. YouTubeアップロード（10分）

**メタデータ**:
```
タイトル:
Universal FHEVM SDK: Multi-Framework Confidential dApp Development

説明:
[VIDEO_SCRIPT.mdのDescriptionセクションをコピー]

タグ:
FHEVM, Web3, Cryptography, React, Vue, TypeScript, Zama,
Confidential Computing, Privacy, Blockchain, Ethereum

サムネイル:
[Canvaで作成した画像]

プレイリスト:
「Zama FHEVM Tutorials」等を作成

字幕:
自動生成 → 確認・修正
```

**チャプター追加**:
```
0:00 Introduction
0:30 Problem & Solution
1:15 Architecture Overview
2:15 React Demo
3:45 Code Comparison
4:30 Vue Support
5:15 Technical Highlights
6:00 Migration & Deployment
6:45 Call to Action
```

---

## 🎨 品質向上のTips

### ビジュアル

**コードフォント**:
```bash
# VSCodeで大きくて見やすいフォント
"editor.fontSize": 16
"editor.fontFamily": "Fira Code, Monaco"
"editor.lineHeight": 1.6
```

**ターミナル**:
```bash
# Oh My Zshテーマで見栄え良く
ZSH_THEME="agnoster"

# または
ZSH_THEME="powerlevel10k"
```

**ブラウザ拡張**:
- Focus Mode - 不要なUIを非表示
- Full Page Screen Capture - スクリーンショット
- Dark Reader - ダークモード統一

### オーディオ

**マイク設定**:
```
macOS:
System Settings → Sound → Input
- Input Volume: 80%
- Reduce Background Noise: On

Loom:
Settings → Audio
- Microphone: Built-in（またはExternal）
- Noise Cancellation: On
```

**録音環境**:
- 静かな部屋（エアコン・ファンオフ）
- マイクに近すぎない（30-50cm）
- 窓を閉める（外部ノイズ遮断）
- カーペット・カーテンで反響軽減

### 編集

**トランジション**:
```
推奨: シンプルなフェード（0.5秒）
避ける: 派手なワイプ、3D効果

シーン切り替え:
- コード表示 → デモ: Fade
- デモ → 説明: Cut
- セクション変更: Fade to black
```

**テキストオーバーレイ**:
```
重要コードスニペット:
- フォント: Fira Code, 18pt
- 背景: 半透明黒（透明度70%）
- 位置: 画面下1/3
- 表示時間: 3-5秒
```

**BGM**:
```
無料BGMサイト:
- YouTube Audio Library
- Epidemic Sound（有料、高品質）
- Artlist（有料、プロ向け）

設定:
- 音量: -20dB（ナレーションより小さく）
- ループ: シームレス
- ジャンル: Ambient, Electronic（落ち着いた雰囲気）
```

---

## 📊 完成チェックリスト

### 録画前 ✓
- [ ] 開発サーバー動作確認
- [ ] MetaMask設定完了
- [ ] VIDEO_SCRIPT.md手元に準備
- [ ] 画面解像度1080p以上
- [ ] 通知オフ
- [ ] 録画ソフト動作確認

### 録画中 ✓
- [ ] ゆっくり明瞭に話す
- [ ] カーソル動きは大きくゆっくり
- [ ] 重要なアクションの前後に間を取る
- [ ] 15シーン全てカバー

### 編集 ✓
- [ ] 不要部分カット
- [ ] チャプター追加
- [ ] 字幕確認
- [ ] 音量調整
- [ ] タイトルカード追加
- [ ] アウトロスライド追加

### アップロード ✓
- [ ] タイトル最適化
- [ ] 説明文詳細記載
- [ ] タグ10個以上
- [ ] サムネイル設定
- [ ] チャプター設定
- [ ] 字幕アップロード
- [ ] プレイリスト追加

### 最終確認 ✓
- [ ] 再生して全体確認
- [ ] リンク動作確認
- [ ] 音質確認
- [ ] 画質確認
- [ ] チャプタージャンプ確認

---

## 🚀 クイックスタート（今すぐ始める）

```bash
# 1. Loomインストール（5分）
open https://www.loom.com/download

# 2. 開発サーバー起動
cd /Users/zdzd/src/github.com/watarus/fhevm-react-template
pnpm --filter site dev

# 3. ブラウザ準備
open http://localhost:3000

# 4. VIDEO_SCRIPT.mdを別ウィンドウで開く
open tmp/VIDEO_SCRIPT.md

# 5. Loom起動 → 録画開始！
```

**20分後にはプロトタイプ完成！**

---

## 💡 おすすめ：Loom + 最小限編集

**理由**:
- ✅ 最速（30-60分で完成）
- ✅ 品質十分（Zama bounty要件満たす）
- ✅ 編集不要（自動編集機能）
- ✅ シェア簡単（即座にURL取得）

**このクオリティで十分**:
- デモ機能が動いている
- 説明が明確
- 音質が聞き取れる
- コードが読める

完璧を目指さず、まず完成させることが重要！

---

**制作時間見積もり**:
- Loom: 30-60分 ⭐ 推奨
- OBS + DaVinci: 2-4時間（プロ品質）
- 自動化: セットアップ込み1-2時間（再利用可能）

**推奨**: まずLoomで作成 → 必要に応じて後でプロ版制作

Good luck! 🎬
