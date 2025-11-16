# Technology Stack

## Architecture

**Edge-First Full Stack**: Cloudflare プラットフォームを活用したサーバーレスアーキテクチャ。フロントエンドとバックエンド API を Cloudflare にデプロイし、高速なグローバル配信を実現。データベースは Supabase の PostgreSQL を使用。

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Frontend Framework**: React 18 + Vite
- **Backend Framework**: Hono (Cloudflare Workers)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Cloudflare Pages (frontend), Cloudflare Workers (API)
- **Runtime**: Node.js 20+ (development), Cloudflare Workers (production)

## Key Libraries

- **UI Styling**: Tailwind CSS 3 (utility-first CSS framework)
- **Routing**: React Router 6 (クライアントサイドルーティング)
- **Validation**: Zod (スキーマ検証とタイプセーフ)
- **Database Client**: @supabase/supabase-js
- **External APIs**:
  - HeartRails Express API (駅情報)
  - 乗換案内ジョルダン (経路検索)

## Development Standards

### Type Safety
- TypeScript strict mode 全体で有効
- `any` 型の使用禁止
- 明示的な型定義を優先
- Zod による実行時バリデーション

### Code Quality
- ESLint + TypeScript ESLint 設定
- React Hooks ルール準拠
- 未使用変数・パラメータの禁止 (noUnusedLocals, noUnusedParameters)

### Testing
- Vitest (単体テスト)
- カバレッジ要件: TBD (現在開発初期段階)

## Development Environment

### Required Tools
- Docker + Docker Compose (開発コンテナ)
- Supabase CLI (ホストマシン上で実行)
- Node.js 20+
- Git

### Common Commands
```bash
# Dev (frontend): docker exec -it <container> sh -c "cd frontend && npm run dev"
# Dev (API): docker exec -it <container> sh -c "cd api && npm run dev"
# Build (frontend): cd frontend && npm run build
# Deploy (frontend): cd frontend && npm run pages:deploy
# Deploy (API): cd api && npm run deploy
# Supabase start: supabase start (ホスト上)
# Supabase stop: supabase stop (ホスト上)
```

## Key Technical Decisions

### Cloudflare Workers の採用理由
- グローバルエッジでの低レイテンシ
- 自動スケーリング
- Hono の Workers 最適化

### React + Vite の選択
- Next.js からの移行 (シンプルさ優先)
- Vite による高速開発体験
- Cloudflare Pages との親和性

### Supabase + ホスト実行構成
- PostgreSQL の柔軟性
- リアルタイム機能 (将来的な拡張)
- Docker コンテナ外での CLI 実行により、ポート競合を回避

### TypeScript Path Alias
- `@/*` → `src/*` (フロントエンドのみ)
- 絶対パスインポートによる可読性向上

---
_Document standards and patterns, not every dependency_
