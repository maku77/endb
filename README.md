# EnDB - 英単語メモアプリ

## 特徴

- 📝 **単語管理**: 英単語の登録、編集、削除、検索
- 🏷️ **カテゴリ管理**: 単語をカテゴリ別に整理
- 📊 **学習記録**: 復習回数、正答率、習熟度の追跡
- 🔐 **管理者認証**: JWT認証による単語管理機能の保護
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## 技術スタック

### フロントエンド
- **SvelteKit**: Reactiveなフレームワーク
- **TypeScript**: 型安全な開発
- **SCSS**: 統率の取れたスタイル管理
- **Cloudflare Pages**: ホスティング

### バックエンド
- **Cloudflare Workers**: エッジコンピューティング
- **Cloudflare D1**: SQLiteデータベース
- **Hono**: 軽量Webフレームワーク
- **TypeScript**: 型安全なAPI実装

## プロジェクト構造

```
endb/
├── backend/                 # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts        # メインエントリポイント
│   │   ├── types.ts        # 型定義
│   │   ├── db.ts           # データベース操作
│   │   ├── middleware/
│   │   │   └── auth.ts     # JWT認証ミドルウェア
│   │   └── routes/         # APIルート
│   │       ├── auth.ts     # 認証API
│   │       ├── words.ts    # 単語API
│   │       ├── categories.ts # カテゴリAPI
│   │       ├── study.ts    # 学習API
│   │       └── stats.ts    # 統計API
│   ├── migrations/
│   │   └── 0001_initial.sql # 初期スキーマ
│   ├── .dev.vars.example   # 開発環境変数のサンプル
│   ├── wrangler.toml       # Workers設定
│   └── package.json
├── frontend/                # SvelteKit アプリ
│   ├── src/
│   │   ├── routes/         # ページ
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte # 単語一覧
│   │   │   ├── login/       # ログインページ
│   │   │   ├── categories/  # カテゴリ管理
│   │   │   ├── study/       # 学習ページ（未実装）
│   │   │   └── stats/       # 統計ページ（未実装）
│   │   ├── lib/
│   │   │   ├── components/ # UIコンポーネント
│   │   │   ├── stores/
│   │   │   │   └── auth.ts # 認証ストア
│   │   │   ├── types.ts    # 型定義
│   │   │   └── api.ts      # APIクライアント
│   │   └── styles/         # SCSS
│   │       ├── variables.scss
│   │       ├── mixins.scss
│   │       └── global.scss
│   ├── svelte.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm
- Cloudflare アカウント
- Wrangler CLI

### バックエンドのセットアップ

1. **依存関係のインストール**
   ```bash
   cd backend
   pnpm install
   ```

2. **D1データベースの作成**
   ```bash
   # D1データベースを作成
   pnpm wrangler d1 create endb

   # 出力されたdatabase_idをwrangler.tomlに設定
   ```

3. **マイグレーションの実行**
   ```bash
   # ローカル環境
   pnpm wrangler d1 execute endb --local --file=./migrations/0001_initial.sql

   # 本番環境
   pnpm wrangler d1 execute endb --file=./migrations/0001_initial.sql
   ```

4. **認証機能の設定（重要）**

   単語・カテゴリの作成・編集・削除には管理者認証が必要です。

   **ローカル開発環境:**
   ```bash
   # サンプルファイルをコピー
   cp .dev.vars.example .dev.vars

   # .dev.vars ファイルを編集して認証情報を設定
   ```

   `.dev.vars` の内容例：
   ```bash
   # 管理者のユーザー名とパスワードを設定
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password-here

   # JWT署名用の秘密鍵（ランダムな長い文字列を設定）
   JWT_SECRET=your-random-secret-key-at-least-32-characters-long
   ```

   **JWT_SECRETの生成例:**
   ```bash
   # Nodeで生成
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # OpenSSLで生成
   openssl rand -hex 32
   ```

   > ⚠️ **重要**: `.dev.vars` ファイルは `.gitignore` で除外されているため、Gitにコミットされません。

   **本番環境（Cloudflare Workers）:**
   ```bash
   # Wranglerを使って本番環境のシークレットを設定
   wrangler secret put ADMIN_USERNAME
   # プロンプトに従って管理者ユーザー名を入力

   wrangler secret put ADMIN_PASSWORD
   # プロンプトに従って安全なパスワードを入力

   wrangler secret put JWT_SECRET
   # プロンプトに従ってJWT秘密鍵を入力
   ```

   設定したシークレットは Cloudflare ダッシュボードの Workers & Pages > あなたのWorker > Settings > Variables で確認できます。

5. **開発サーバーの起動**
   ```bash
   pnpm dev
   ```

   Workers は `http://localhost:8787` で起動します。

### フロントエンドのセットアップ

1. **依存関係のインストール**
   ```bash
   cd frontend
   pnpm install
   ```

2. **環境変数の設定（オプション）**

   デフォルトでは `http://localhost:8787` の API を参照します。別の URL を使用する場合:

   ```bash
   # サンプルファイルをコピー
   cp .env.example .env.local

   # .env.local を編集してAPI URLを設定
   ```

   `.env.local` の内容例：
   ```bash
   # API Base URL (デフォルト: http://localhost:8787)
   PUBLIC_API_URL=http://localhost:8787
   ```

3. **開発サーバーの起動**
   ```bash
   pnpm dev
   ```

   アプリケーションは `http://localhost:5173` で起動します。

## ログインと認証

### 初回ログイン

1. ブラウザで `http://localhost:5173/login` にアクセス
2. バックエンドの `.dev.vars` で設定した `ADMIN_USERNAME` と `ADMIN_PASSWORD` を入力
3. ログイン成功後、単語・カテゴリの作成・編集・削除が可能になります

### 認証が必要な操作

- ✅ **認証不要**: 単語・カテゴリの閲覧、学習機能
- 🔒 **認証必要**: 単語・カテゴリの作成、編集、削除

### トークンの有効期限

- JWTトークンの有効期限: **24時間**
- 期限切れ後は自動的にログアウトされ、再ログインが必要です

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン（トークン発行）

### 単語管理
- `GET /api/words` - 単語一覧取得
  - クエリパラメータ: `search`, `category_id`, `mastery_level`
- `GET /api/words/:id` - 単語詳細取得
- `POST /api/words` - 単語登録 🔒
- `PUT /api/words/:id` - 単語更新 🔒
- `DELETE /api/words/:id` - 単語削除 🔒

### カテゴリ管理
- `GET /api/categories` - カテゴリ一覧取得
- `GET /api/categories/:id` - カテゴリ詳細取得
- `POST /api/categories` - カテゴリ作成 🔒
- `PUT /api/categories/:id` - カテゴリ更新 🔒
- `DELETE /api/categories/:id` - カテゴリ削除 🔒

### 学習機能
- `GET /api/study/random?count=10` - ランダムに単語取得
- `POST /api/study/record` - 学習結果記録

### 統計情報
- `GET /api/stats` - 統計情報取得

## データベーススキーマ

### words テーブル
- `id`: 単語ID
- `en`: 英単語
- `ja`: 日本語訳
- `example`: 例文
- `notes`: メモ
- `category_id`: カテゴリID
- `created_at`: 作成日時
- `updated_at`: 更新日時
- `last_reviewed_at`: 最終復習日時
- `review_count`: 復習回数
- `correct_count`: 正解回数
- `mastery_level`: 習熟度（0-5）

### categories テーブル
- `id`: カテゴリID
- `name`: カテゴリ名
- `color`: カラーコード
- `description`: 説明
- `created_at`: 作成日時

### study_sessions テーブル
- `id`: セッションID
- `word_id`: 単語ID
- `result`: 結果（correct/incorrect）
- `timestamp`: タイムスタンプ

## デプロイ

### バックエンド（Workers）のデプロイ

1. **本番環境のシークレットを設定**（初回のみ）
   ```bash
   cd backend

   # 管理者認証情報を設定
   wrangler secret put ADMIN_USERNAME
   wrangler secret put ADMIN_PASSWORD
   wrangler secret put JWT_SECRET
   ```

2. **デプロイ実行**
   ```bash
   pnpm run deploy
   ```

### フロントエンド（Pages）のデプロイ

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Cloudflare Pagesでプロジェクトを作成**
   - Cloudflare ダッシュボードから Pages を選択
   - GitHubリポジトリを連携
   - ビルド設定:
     - Build command: `pnpm build`
     - Build output directory: `build`
     - Root directory: `frontend`

3. **環境変数の設定（重要）**

   Cloudflare Pages のダッシュボードで以下の環境変数を設定:

   - `NODE_VERSION`: `18` または `20`
   - `PUBLIC_API_URL`: バックエンドのWorkers URL（例: `https://endb-backend.maku77.workers.dev`）

   **設定手順:**
   1. Cloudflare ダッシュボード > Pages > プロジェクト選択
   2. Settings > Environment variables
   3. Production タブで「Add variable」をクリック
   4. Variable name: `PUBLIC_API_URL`
   5. Value: `https://your-backend-url.workers.dev`（実際のWorkers URLに置き換え）
   6. 「Save」をクリック
   7. デプロイを再実行（Deployments > 最新デプロイの「Retry deployment」）

## 今後の実装予定

### フェーズ2: 学習機能
- [ ] フラッシュカード UI
- [ ] クイズモード
- [ ] 学習履歴の記録

### フェーズ3: 進捗管理
- [ ] ダッシュボード
- [ ] 統計グラフ
- [ ] 復習通知システム
- [ ] 間隔反復学習アルゴリズム

### 追加機能案
- [ ] 音声読み上げ（Web Speech API）
- [ ] CSV/JSONでのインポート/エクスポート
- [ ] ダークモード
- [ ] PWA対応（オフライン学習）

