# Seishun18 Random Journey

## プロジェクト概要
このプロジェクトは、ランダムな旅行先を提案するウェブアプリケーションです。

## 技術スタック
- フロントエンド: Next.js (Vercel)
- バックエンド: Cloudflare Workers
- データベース: Cloudflare D1

## 開発環境のセットアップ
```bash
# リポジトリのクローン
git clone https://github.com/yourusername/seishun18-random-journey.git
cd seishun18-random-journey

# Docker Composeでローカル環境を起動
docker-compose up -d
```

## ディレクトリ構成
```
seishun18-random-journey/
├── .github/            # GitHub Actions の CI/CD 設定
├── .devcontainer/      # 開発環境のDevContainer設定
├── docs/               # プロジェクトドキュメント
├── frontend/           # フロントエンド (Next.js)
├── api/                # バックエンド (Cloudflare Workers)
└── docker-compose.yml  # ローカル開発用 Docker 設定
```

## ライセンス
MIT 