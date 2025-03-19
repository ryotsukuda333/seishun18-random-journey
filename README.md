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
- 開発環境: Docker, DevContainer

## 外部 API

- 駅情報: HeartRails Express API
- 経路検索: 乗換案内ジョルダン（青春 18 切符検索）

## 詳細な開発環境セットアップ

このプロジェクトは、Docker 開発環境と Supabase CLI を使用しています。

### 前提条件

- Docker と Docker Compose
- Git
- VS Code (推奨、DevContainer をサポート)

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourname/seishun18-random-journey.git
cd seishun18-random-journey
```

2. 開発コンテナを起動

```bash
docker-compose up -d
```

3. コンテナに接続（VS Code の場合は DevContainer で開く）

```bash
docker exec -it seishun18-random-journey-app-1 sh
```

4. コンテナ内で Supabase 環境を初期化

```bash
# 初回のみ実行
supabase init

# Supabaseローカル環境を起動
supabase start
```

5. 環境変数ファイルを設定

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

6. 依存関係のインストールとローカルサーバー起動

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド（別ターミナルで）
cd api
npm install
npm run dev
```

7. アクセス方法

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8787
- Supabase Studio: http://localhost:54321

### 開発時の注意点

- Supabase の起動と停止

```bash
# 起動
supabase start

# 停止
supabase stop
```

- データベース変更の適用

```bash
# 新しいマイグレーションファイルの作成
supabase migration new <変更名>

# マイグレーションの適用
supabase db reset
```

- TypeScript 型定義の生成

```bash
supabase gen types typescript > frontend/src/types/supabase.ts
```
