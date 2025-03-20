# 青春 18 切符ランダム旅行検索アプリ

現在地からランダムな駅を選び、青春 18 切符での行き方を提案するウェブアプリケーション。

## 概要

このアプリケーションは、位置情報から最寄り駅を特定し、日本国内のランダムな駅への青春 18 切符を使った経路を提案します。冒険的な鉄道旅行のきっかけ作りに最適です。

## 機能

- 現在地の位置情報取得
- ランダムな目的地駅の提案
- 青春 18 切符での経路検索
- 検索結果の SNS 共有
- 検索履歴の保存

## 技術スタック

- フロントエンド: React + Vite (Cloudflare Pages)
- バックエンド API: Hono (Cloudflare Workers)
- データベース: Supabase (PostgreSQL)
- 開発環境: Docker, ホスト上の Supabase CLI

## 外部 API

- 駅情報: HeartRails Express API
- 経路検索: 乗換案内ジョルダン（青春 18 切符検索）

## 詳細な開発環境セットアップ

このプロジェクトでは、フロントエンドとバックエンドの開発に Docker を使用し、Supabase はホスト上で直接実行します。

### 前提条件

- Docker と Docker Compose
- Git
- VS Code (推奨、DevContainer をサポート)
- Supabase CLI (ホストマシンにインストール)

### Supabase CLI のインストール

**Mac の場合:**

```bash
brew install supabase/tap/supabase
```

**Windows の場合:**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux の場合:**

```bash
curl -s https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourname/seishun18-random-journey.git
cd seishun18-random-journey
```

2. Supabase 環境を初期化（ホスト上で実行）

```bash
# 初回のみ実行
npm install supabase --save-dev
npx supabase init

# Supabaseローカル環境を起動
npx supabase start
```

3. 開発コンテナを起動

```bash
docker-compose up -d
```

4. 環境変数ファイルを設定

```bash
# supabase startの出力されたURLとAPIキーを使って.envファイルを作成
# 表示されたURLとAPIキーを以下のコマンドの対応する箇所に置き換える
cat > .env << EOL
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<表示されたanon key>
SUPABASE_SERVICE_ROLE_KEY=<表示されたservice_role key>
EOL

# フロントエンド用環境変数ファイル
cat > frontend/.env.local << EOL
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<表示されたanon key>
VITE_API_URL=http://localhost:8787
EOL
```

5. 依存関係のインストールとローカルサーバー起動

**フロントエンド:**

```bash
# コンテナに接続してフロントエンドサーバーを起動
docker exec -it seishun18-random-journey-app-1 sh -c "cd frontend && npm install && npm run dev"
```

**バックエンド:**

```bash
# 別ターミナルを開き、コンテナに接続してバックエンドサーバーを起動
docker exec -it seishun18-random-journey-app-1 sh -c "cd api && npm install && npm run dev"
```

6. アクセス方法

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8787
- Supabase Studio: http://localhost:54321

### 開発時の注意点

- Supabase の起動と停止（ホスト上で実行）

```bash
# 起動
supabase start

# 停止
supabase stop
```

- データベース変更の適用（ホスト上で実行）

```bash
# 新しいマイグレーションファイルの作成
supabase migration new <変更名>

# マイグレーションの適用
supabase db reset
```

- TypeScript 型定義の生成（ホスト上で実行）

```bash
supabase gen types typescript > frontend/src/types/supabase.ts
```

- Docker 環境の停止

```bash
docker-compose down
```

### 注意点

- Supabase CLI はホストマシン上で実行し、フロントエンドとバックエンドの開発は Docker コンテナ内で行います
- ホスト上で起動した Supabase にはコンテナ内からも localhost で接続できます
- マイグレーションやデータベース変更はすべてホスト上の Supabase CLI を使って管理します
