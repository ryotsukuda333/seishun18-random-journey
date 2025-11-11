# Implementation Tasks: random-journey-generator

**作成日**: 2025-11-11
**ステータス**: タスク生成完了
**合計タスク数**: 28 (メジャータスク)
**推定実装期間**: 10-15日

---

## Phase 1: プロジェクト基盤とインフラ構築

- [x] 1. Supabase プロジェクト初期化とデータベーススキーマ構築 (P)
  - Supabase プロジェクト作成と認証設定
  - search_histories テーブル作成 (UUID, session_id, departure_station, destination_station, jorudan_link, created_at)
  - announcements テーブル作成 (UUID, title, content, type, is_active, start_date, end_date, created_at, updated_at)
  - Row Level Security (RLS) ポリシー設定 (匿名ユーザー向け session_id ベース)
  - インデックス作成 (session_id, is_active + start_date 複合インデックス)
  - 更新日時自動更新トリガー作成
  - 30日経過データ自動削除関数と Cron Job 設定
  - _Requirements: 8.7_

- [x] 2. Cloudflare Workers プロジェクトセットアップ (P)
  - Hono ベースの Workers プロジェクト初期化
  - TypeScript 設定 (strict mode 有効化)
  - wrangler.toml 設定 (環境変数, KV Namespaces バインディング)
  - Workers KV Namespaces 作成 (STATION_CACHE, JOURNEY_RATE_LIMIT, STATION_SEARCH_RATE_LIMIT)
  - CORS ミドルウェア設定 (Hono CORS)
  - ロガーミドルウェア実装
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 3. Cloudflare Pages フロントエンドプロジェクトセットアップ (P)
  - React 18 + Vite プロジェクト初期化
  - TypeScript 設定 (strict mode)
  - Tailwind CSS 3 セットアップ
  - React Router 6 設定
  - 環境変数設定 (.env.example, .env.local)
  - ESLint + Prettier 設定
  - _Requirements: 9.1_

---

## Phase 2: バックエンドAPI実装

### 4. HeartRails Express API 統合とキャッシュ層実装

- HeartRails API クライアント関数実装 (駅名検索, 最寄り駅検索, 全駅一覧取得)
- XML パース処理実装
- Workers KV キャッシュロジック実装 (TTL 24時間)
- エラーハンドリングと Exponential Backoff リトライ実装
- _Requirements: 1.2, 1.5, 2.1, 7.4_

### 5. POST /api/station/nearest エンドポイント実装

- Zod バリデーションスキーマ定義 (GeoCoordinatesSchema)
- リクエストボディバリデーション
- Workers KV キャッシュチェック (nearest_cache:{lat},{lng})
- HeartRails API 呼び出し (Cache Miss 時)
- レスポンス生成とキャッシュ保存
- エラーレスポンス実装 (EXTERNAL_API_ERROR, INVALID_COORDINATES)
- _Requirements: 1.2, 1.4_

### 6. GET /api/station/search エンドポイント実装

- クエリパラメータ検証
- HeartRails API 駅名検索呼び出し
- XML パースと Station[] 配列変換
- エラーレスポンス実装 (NO_RESULTS, EXTERNAL_API_ERROR)
- _Requirements: 1.5_

### 7. POST /api/journey/random エンドポイント実装

- [ ] 7.1 基本実装とバリデーション (P)
  - Zod バリデーションスキーマ定義 (JourneyRandomRequestSchema)
  - リクエストボディバリデーション
  - Workers KV から全駅一覧取得 (Cache Hit/Miss 処理)
  - セッションID生成 (UUID v4)
  - _Requirements: 2.1, 2.6_

- [ ] 7.2 フィルタリングロジック実装 (P)
  - Haversine 公式による距離計算関数実装
  - 距離レンジフィルタリング
  - 方角フィルタリング (北/南/東/西 判定)
  - 都道府県除外フィルタリング
  - 海上座標スナップロジック実装 (最寄りの陸地駅検索)
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 7.3 ランダム抽選とリンク生成
  - Workers KV によるレート制限チェック (IP別: 10回/日)
  - フィルタリング済み駅配列からランダム選択 (Math.random())
  - ジョルダン外部リンク生成関数実装
  - Journey オブジェクト組み立て
  - エラーレスポンス実装 (NO_SUITABLE_DESTINATION, RETRY_LIMIT_EXCEEDED, RATE_LIMIT_EXCEEDED)
  - _Requirements: 2.1, 3.3, 3.4, 8.7_

### 8. GET /api/announcements エンドポイント実装

- Supabase クライアント設定
- 有効なお知らせクエリ (is_active = true, start_date/end_date フィルタリング)
- レスポンス生成 (Announcement[] 配列)
- エラーハンドリング (DATABASE_ERROR)
- _Requirements: 6.7_

### 9. GET /api/station/search レート制限実装

- Workers KV によるレート制限チェック (IP別: 20回/日)
- レート制限カウンター更新
- エラーレスポンス実装 (RATE_LIMIT_EXCEEDED)
- _Requirements: 8.7_

---

## Phase 3: フロントエンド実装

### 10. 共通コンポーネントと型定義 (P)

- TypeScript 型定義ファイル作成 (Station, Journey, Announcement)
- Zod バリデーションスキーマ定義 (フロントエンド側)
- セッション管理ユーティリティ実装 (localStorage session_id)
- Supabase クライアント設定 (カスタムヘッダー: x-session-id)
- _Requirements: 8.3, 8.4_

### 11. Footer コンポーネント実装 (P)

- HeartRails Express クレジット表記
- ナビゲーションリンク (利用規約, プライバシーポリシー, お問い合わせ)
- 著作権表示
- Tailwind CSS スタイリング
- _Requirements: 6.1, 6.8_

### 12. AnnouncementBanner コンポーネント実装

- GET /api/announcements API 呼び出し
- お知らせ一覧表示 (type 別スタイリング: info/warning/maintenance)
- 閉じるボタン実装
- localStorage による閉じたお知らせID管理
- 固定ヘッダー配置 (z-index 対応)
- _Requirements: 6.7_

### 13. useGeolocation Hook 実装

- navigator.geolocation.getCurrentPosition 呼び出し
- 位置情報取得成功・失敗ハンドリング
- タイムアウト設定 (10秒)
- enableHighAccuracy オプション設定
- エラー状態管理 (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT)
- _Requirements: 1.1, 1.3_

### 14. useJourneyGeneration Hook 実装

- POST /api/journey/random API 呼び出し
- ローディング状態管理
- エラーハンドリング
- リトライ機能実装 (最後のリクエストパラメータ保持)
- Journey オブジェクト状態管理
- _Requirements: 2.6, 5.5_

### 15. LandingPage コンポーネント実装

- [ ] 15.1 HeroSection と RandomJourneyButton
  - ヒーローセクション UI 実装
  - ランダム旅ボタン実装 (useGeolocation Hook 統合)
  - ローディング状態表示 (スピナー)
  - 位置情報拒否時のフォールバックUI
  - _Requirements: 1.1, 6.1, 6.7_

- [ ] 15.2 FilterSection 実装 (Collapsible)
  - 折りたたみ可能セクション実装
  - 距離レンジスライダー (DistanceRangeSlider)
  - 方角セレクター (DirectionSelector: N/S/E/W)
  - 都道府県除外チェックボックス (PrefectureExcludeCheckboxes)
  - _Requirements: 2.3, 2.4, 2.5, 6.2_

- [ ] 15.3 手動駅名入力フォールバックUI
  - 駅名入力フィールド実装
  - GET /api/station/search API 呼び出し
  - 候補駅リスト表示
  - 候補駅選択処理
  - _Requirements: 1.3, 1.5, 5.1, 5.2_

### 16. ResultPage コンポーネント実装

- [ ] 16.1 JourneyCard 実装
  - 出発駅・目的地駅情報表示
  - ジョルダン外部リンクボタン
  - 共有ボタン実装 (Web Share API)
  - Clipboard API フォールバック実装
  - カード形式デザイン (Tailwind CSS)
  - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.7, 6.3_

- [ ] 16.2 リトライボタンと履歴リンク
  - 再抽選ボタン実装 (useJourneyGeneration.retry)
  - 履歴ページリンク
  - エラーメッセージ表示
  - _Requirements: 2.6, 5.5_

### 17. HistoryPage コンポーネント実装

- Supabase クライアント統合
- 検索履歴クエリ (session_id フィルタリング)
- 履歴リスト表示 (出発駅, 目的地駅, 作成日時)
- 履歴削除機能
- _Requirements: 8.3_

### 18. TermsPage コンポーネント実装

- react-markdown パーサー統合
- Markdown ファイル読み込み (/src/content/terms.md)
- ページヘッダー実装
- ホームへ戻るボタン
- _Requirements: 6.6_

### 19. PrivacyPage コンポーネント実装

- react-markdown パーサー統合
- Markdown ファイル読み込み (/src/content/privacy.md)
- ページヘッダー実装
- ホームへ戻るボタン
- _Requirements: 6.6_

### 20. ContactPage コンポーネント実装

- Googleフォーム作成 (お問い合わせフォーム)
- iframe埋め込みコード取得
- ContactPageコンポーネント実装 (iframe表示)
- ページヘッダー実装
- ホームへ戻るボタン
- _Requirements: 6.6_

### 21. ErrorPage コンポーネント実装

- エラーメッセージ表示
- ホームへ戻るボタン
- 404 エラー対応
- React Router errorElement 統合
- _Requirements: 5.7_

### 22. React Router 設定とルーティング実装

- ルート定義 (/, /result/:sessionId, /history, /terms, /privacy, /contact, /error)
- Lazy Loading 設定 (Code Splitting)
- errorElement 設定
- アクセシビリティ考慮 (フォーカス管理)
- _Requirements: 6.6_

---

## Phase 4: テスト・最適化・デプロイ

### 23. バックエンド API 統合テスト実装

- Miniflare によるローカルテスト環境構築
- POST /api/station/nearest テスト (成功・失敗・バリデーションエラー)
- GET /api/station/search テスト (レート制限動作確認)
- POST /api/journey/random テスト (フィルタリング動作確認、レート制限動作確認)
- GET /api/announcements テスト
- _Requirements: 7.4_

### 24. フロントエンド E2E テスト実装 (Playwright)

- [ ] 24.1 ハッピーパステスト
  - 位置情報許可シナリオ
  - ランダム旅生成完了まで
  - 共有ボタン動作確認
  - _Requirements: 1.1, 2.1, 4.2_

- [ ] 24.2 エラーハンドリングテスト
  - 位置情報拒否シナリオ
  - 手動駅名入力フォールバック
  - 外部API障害シミュレーション
  - _Requirements: 1.3, 5.1, 5.3_

- [ ]* 24.3 アクセシビリティテスト (オプション)
  - WCAG AA 基準確認
  - キーボードナビゲーション
  - スクリーンリーダー対応
  - _Requirements: 6.4, 6.5, 6.6_

### 25. パフォーマンス最適化

- Vite Code Splitting 設定確認
- Tailwind CSS PurgeCSS 設定
- 画像最適化 (WebP 変換)
- Cloudflare Pages CDN 設定確認
- Core Web Vitals 測定 (Lighthouse)
- _Requirements: 7.1, 7.2, 7.3_

### 26. GitHub Actions CI/CD パイプライン構築

- フロントエンドデプロイワークフロー (Cloudflare Pages)
- バックエンドデプロイワークフロー (Cloudflare Workers)
- 環境変数シークレット設定 (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- main ブランチ自動デプロイ設定
- _Requirements: 9.5_

### 27. 環境変数設定

- wrangler.toml 環境変数設定 (FRONTEND_ORIGIN, SUPABASE_URL, SUPABASE_ANON_KEY)
- フロントエンド .env 設定 (VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- .env.example ファイル作成
- _Requirements: 8.1, 9.4_

### 28. 法的文書とクレジット表記の最終確認

- 利用規約 Markdown ファイル作成 (/frontend/src/content/terms.md)
- プライバシーポリシー Markdown ファイル作成 (/frontend/src/content/privacy.md)
- Footer コンポーネント HeartRails クレジット表記確認
- OGP メタタグ設定 (index.html)
- _Requirements: 3.7, 4.5, 4.6_

---

## タスク実装ガイドライン

### 並列実行可能タスク (P マーク)
以下のタスクは互いに依存関係がなく、並列実行可能です:
- タスク 1, 2, 3 (インフラ構築)
- タスク 10, 11 (共通コンポーネント)

### 逐次実行必須タスク
以下のタスクは前段階完了が必須です:
- タスク 4 → タスク 5, 6, 7 (HeartRails 統合が先)
- タスク 13, 14 → タスク 15 (Hooks が先)
- タスク 10 → タスク 16-21 (型定義とセッション管理が先)

### テスト戦略
- [ ]* マークのタスクは MVP 後に延期可能
- 各フェーズ完了後に統合テスト実行推奨
- Phase 4 完了前に全機能の動作確認必須

---

## 要件マッピングサマリー

| 要件ID | 対応タスク |
|-------|----------|
| Req 1 | 4, 5, 6, 13, 15.1, 15.3 |
| Req 2 | 4, 7, 14, 15.2 |
| Req 3 | 7.3, 16.1 |
| Req 4 | 16.1 |
| Req 5 | 5, 6, 7, 15.3, 16.2, 21 |
| Req 6 | 11, 15, 16, 18, 19, 20, 21, 22 |
| Req 7 | 4, 23, 25 |
| Req 8 | 1, 2, 10, 27 |
| Req 9 | 1, 2, 3, 26, 27 |

---

**次のアクション**: `/kiro:spec-impl random-journey-generator [task-numbers]` で実装開始
