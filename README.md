# 青春18切符ランダム旅行ジェネレーター

現在地からランダムな目的地駅を提案し、青春18切符での行き方を表示するウェブアプリケーション。

## 技術スタック

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Hono + Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (API)

## プロジェクト構成

```
seishun18-random-journey/
├── frontend/          # React フロントエンドアプリケーション
├── api/              # Cloudflare Workers API
├── supabase/         # データベーススキーマとマイグレーション
└── .kiro/            # Kiro Framework 仕様ドキュメント
```

## 開発環境のセットアップ

### 前提条件

- Docker + Docker Compose
- Supabase CLI (ホストマシンにインストール)
- VS Code (推奨: DevContainer使用)

### セットアップ手順

#### 方法1: VS Code DevContainer (推奨)

1. **Supabaseの起動** (ホスト上で実行)

```bash
supabase start
```

2. **DevContainerで開く**

VS Codeでプロジェクトを開き、「Reopen in Container」を選択

3. **依存関係のインストール** (コンテナ内)

```bash
# API
cd api && npm install

# Frontend
cd frontend && npm install
```

4. **環境変数の設定**

```bash
# API
cp api/.env.example api/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

5. **開発サーバーの起動** (コンテナ内)

```bash
# API (別ターミナル)
cd api && npm run dev

# Frontend (別ターミナル)
cd frontend && npm run dev
```

#### 方法2: Docker Composeのみ

1. **Supabaseの起動** (ホスト上で実行)

```bash
supabase start
```

2. **Dockerコンテナの起動**

```bash
docker-compose up -d
```

3. **コンテナに入る**

```bash
docker-compose exec dev bash
```

4. **依存関係のインストール** (コンテナ内)

```bash
# API
cd api && npm install

# Frontend
cd frontend && npm install
```

5. **環境変数の設定**

```bash
# API
cp api/.env.example api/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

6. **開発サーバーの起動** (コンテナ内)

```bash
# API (別ターミナル)
cd api && npm run dev

# Frontend (別ターミナル)
cd frontend && npm run dev
```

### アクセス

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8787
- **Supabase Studio**: http://localhost:54323

## デプロイ

### Cloudflare Pages (Frontend)

```bash
cd frontend
npm run build
npm run pages:deploy
```

### Cloudflare Workers (API)

```bash
cd api
npm run deploy
```

## ライセンス

MIT
