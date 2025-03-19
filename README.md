# 青春18切符ランダム旅行検索アプリ

現在地からランダムな駅を選び、青春18切符での行き方を提案するウェブアプリケーション。

## 概要

このアプリケーションは、位置情報から最寄り駅を特定し、日本国内のランダムな駅への青春18切符を使った経路を提案します。冒険的な鉄道旅行のきっかけ作りに最適です。

## 機能

- 現在地の位置情報取得
- ランダムな目的地駅の提案
- 青春18切符での経路検索
- 検索結果のSNS共有
- 検索履歴の保存

## 技術スタック

- フロントエンド: React + Vite (Cloudflare Pages)
- バックエンドAPI: Hono (Cloudflare Workers)
- データベース: Supabase (PostgreSQL)
- 開発環境: Docker, DevContainer

## 外部API

- 駅情報: HeartRails Express API
- 経路検索: 乗換案内ジョルダン（青春18切符検索）

## 開発環境のセットアップ

```bash
# Docker Composeでの起動
docker-compose up -d

# フロントエンド開発
cd frontend
npm install
npm run dev

# バックエンド開発
cd api
npm install
npm run dev