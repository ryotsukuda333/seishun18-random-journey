# Project Structure

## Organization Philosophy

**Monorepo with Frontend/Backend Separation**: フロントエンドとバックエンド API を独立したディレクトリで管理し、それぞれ独立してビルド・デプロイ可能。Docker + Supabase によるローカル開発環境を整備。

## Directory Patterns

### Frontend (`/frontend/`)
**Location**: `/frontend/`
**Purpose**: React + Vite フロントエンドアプリケーション
**Example**:
```
frontend/
├── src/
│   ├── App.tsx         # メインアプリケーションコンポーネント
│   ├── main.tsx        # エントリーポイント
│   └── styles/         # グローバルスタイル
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

### API (`/api/`)
**Location**: `/api/`
**Purpose**: Hono ベースの Cloudflare Workers API
**Example**:
```
api/
├── src/
│   └── index.ts        # API エントリーポイント
├── wrangler.toml       # Workers 設定
├── tsconfig.json
└── package.json
```

### Supabase (`/supabase/`)
**Location**: `/supabase/`
**Purpose**: データベーススキーマとマイグレーション
**Example**:
```
supabase/
├── config.toml         # Supabase CLI 設定
├── seed/
│   └── 00-initial-schema.sql  # 初期スキーマ
└── .gitignore
```

### Development Environment
**Location**: `/` (ルート)
**Purpose**: Docker 開発環境とプロジェクト全体設定
**Example**:
```
/
├── Dockerfile          # 開発コンテナ定義
├── docker-compose.yml  # オーケストレーション
├── .devcontainer/      # VS Code DevContainer 設定
└── .vscode/            # VS Code 設定
```

## Naming Conventions

- **Files**:
  - React Components: PascalCase (`App.tsx`, `SearchPage.tsx`)
  - Utilities/Configs: kebab-case (`vite.config.ts`, `tailwind.config.js`)
  - TypeScript configs: lowercase (`tsconfig.json`)
- **Components**: PascalCase (例: `HomePage`, `SearchPage`)
- **Functions**: camelCase (例: `getStationInfo`, `searchRoute`)
- **Constants**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)

## Import Organization

### Frontend (with Path Alias)
```typescript
// External dependencies (React, etc.)
import { Routes, Route } from 'react-router-dom'

// Absolute imports (@/* alias)
import { Component } from '@/components/Component'
import { useApi } from '@/hooks/useApi'

// Relative imports (local files)
import './styles.css'
```

**Path Aliases**:
- `@/*`: `/frontend/src/*` (フロントエンドのみ)

### API (Standard Node Resolution)
```typescript
// External dependencies
import { Hono } from 'hono'
import { z } from 'zod'

// Relative imports only (no path aliases)
import { middleware } from './middleware'
```

## Code Organization Principles

### Separation of Concerns
- フロントエンド: UI とユーザーインタラクション
- API: ビジネスロジックと外部 API 統合
- Supabase: データ永続化層

### Development Workflow
1. **ホスト**: Supabase CLI で DB 起動
2. **Docker**: フロントエンド + API 開発環境
3. **Localhost 接続**: コンテナから localhost 経由で Supabase にアクセス

### Deployment Targets
- Frontend → Cloudflare Pages
- API → Cloudflare Workers
- Database → Supabase (本番環境)

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
