# 技術調査ログ: random-journey-generator

**作成日**: 2025-11-11
**フェーズ**: 設計段階
**調査範囲**: 外部依存関係、技術スタック妥当性検証

---

## 1. 外部API調査

### 1.1 HeartRails Express API (駅情報取得)

**調査日**: 2025-11-11
**目的**: 最寄り駅特定および駅情報取得の実現可能性確認

**調査結果**:
- **公式ドキュメント**: http://express.heartrails.com/
- **APIタイプ**: 無料XML/JSON API (クレジット表記必須)
- **最終更新**: 2021年 (2025年現在も稼働確認済み)
- **利用可能エンドポイント**:
  - 駅名検索: `/api/xml?method=getStations&name={駅名}`
  - 路線別駅一覧: `/api/xml?method=getStations&line={路線名}`
  - 座標から最寄り駅: `/api/xml?method=getStations&x={経度}&y={緯度}`
  - 全駅一覧: `/api/xml?method=getStations` (キャッシュ推奨)
- **レスポンス形式**: XML or JSON (パラメータで指定可能)

**設計への影響**:
- ✅ **採用決定**: 要件1 (位置情報取得と出発駅特定) および 要件2 (ランダム目的地駅選定) に対応可能
- **制約事項**: クレジット表記をフロントエンドフッターに実装必要
- **キャッシング戦略**: 全駅一覧は Cloudflare Workers KV に24時間キャッシュ (帯域幅削減)

**TypeScript型定義案**:
```typescript
interface HeartRailsStation {
  name: string;        // 駅名
  prefecture: string;  // 都道府県
  line: string;        // 路線名
  x: number;          // 経度
  y: number;          // 緯度
}
```

---

### 1.2 ジョルダン経路検索API

**調査日**: 2025-11-11
**目的**: 青春18切符対応経路検索機能の実現可能性確認

**調査結果**:
- ❌ **公開APIドキュメント未発見**: ジョルダン社の公式ウェブサイトに一般開発者向けAPIドキュメント無し
- **既存実装調査**: ジョルダン乗換案内アプリには「JRパスフィルター」「普通電車のみ」オプション存在
- **API提供形態推測**: 商用契約ベースでのAPI提供と思われる
- **代替手段調査**: Google Maps Directions API, Yahoo!路線情報API は青春18切符特化フィルターなし

**設計への影響**:
- ⚠️ **ブロッカー候補**: 経路検索機能 (要件3) の直接API統合は困難
- **暫定的代替策**:
  1. **外部リンク方式**: 検索結果としてジョルダンの外部リンクを生成し、ユーザーを外部サイトへ誘導
     - URL形式例: `https://www.jorudan.co.jp/norikae/cgi/nori.cgi?eki1={出発駅}&eki2={到着駅}&Dym=...&Ddd=...&Dhh=...&Dmn=...&type=1` (type=1: 普通列車優先)
  2. **将来的拡張**: ジョルダン社への商用API利用申請を別途検討

**次のアクション**:
- MVP (Minimum Viable Product) では外部リンク方式を採用
- 要件3の受け入れ条件を「経路検索結果へのリンク提示」に調整検討

**設計文書への記載事項**:
- 外部依存関係としてジョルダンWebサイトへの依存を明記
- API統合は将来フェーズに延期

---

## 2. フロントエンド技術調査

### 2.1 React 18 Geolocation API ベストプラクティス

**調査日**: 2025-11-11
**目的**: 位置情報取得の堅牢な実装パターン確認

**調査結果**:
- **標準API**: `navigator.geolocation.getCurrentPosition()`
- **エラーハンドリング必須ケース**:
  1. `PERMISSION_DENIED (code: 1)`: ユーザーが位置情報を拒否
  2. `POSITION_UNAVAILABLE (code: 2)`: 位置情報取得失敗 (GPS圏外など)
  3. `TIMEOUT (code: 3)`: タイムアウト (デフォルト: 無限待機)

**ベストプラクティス**:
- ✅ **手動入力フォールバック必須**: 位置情報拒否時に駅名手入力UIを表示
- ✅ **タイムアウト設定**: `timeout: 10000` (10秒) 推奨
- ✅ **高精度オプション**: `enableHighAccuracy: true` (バッテリー消費と精度のトレードオフ)
- ✅ **ローディング状態管理**: 位置情報取得中のUXフィードバック

**実装パターン例** (React Hook):
```typescript
const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      setPosition,
      setError,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { position, error };
};
```

**設計への影響**:
- 要件1の受け入れ条件3 (位置情報拒否時の代替入力) の実装戦略確定

---

### 2.2 Hono CORS Middleware

**調査日**: 2025-11-11
**目的**: Cloudflare Workers API の CORS 設定ベストプラクティス確認

**調査結果**:
- **公式パッケージ**: `hono/cors` (Hono組み込みミドルウェア)
- **基本設定**:
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors({
  origin: ['https://your-frontend-domain.pages.dev'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));
```

- **動的origin検証**: 環境変数ベースで本番/開発環境切り替え
- **セキュリティ**: `origin: '*'` は避け、明示的なドメインリスト推奨

**設計への影響**:
- API設計の非機能要件としてCORS設定を明記
- 環境変数 `FRONTEND_ORIGIN` を wrangler.toml で管理

---

## 3. バックエンド技術調査

### 3.1 Supabase RLS (Row Level Security) - 匿名ユーザー対応

**調査日**: 2025-11-11
**目的**: 匿名ユーザーによる履歴保存機能の実現可能性確認

**調査結果**:
- **Supabase認証方式**: `anon` ロール (匿名) と `authenticated` ロール (認証済み)
- **RLSポリシー必須**: すべての public スキーマテーブルでRLS有効化必要

**ベストプラクティス**:
1. **RLS有効化**:
```sql
ALTER TABLE search_histories ENABLE ROW LEVEL SECURITY;
```

2. **匿名ユーザー用ポリシー** (session_id ベース):
```sql
CREATE POLICY "Anonymous users can manage their own histories"
ON search_histories
FOR ALL
USING (session_id = current_setting('request.jwt.claims')::json->>'session_id')
WITH CHECK (session_id = current_setting('request.jwt.claims')::json->>'session_id');
```

3. **パフォーマンス最適化**: RLSポリシーで使用するカラムにインデックス作成
```sql
CREATE INDEX idx_search_histories_session_id ON search_histories(session_id);
```

4. **セキュリティ注意事項**:
   - `user_metadata` ではなく `raw_app_meta_data` を使用 (改ざん防止)
   - 匿名ユーザーの履歴保存期限設定 (30日後自動削除など)

**設計への影響**:
- データモデルに `session_id` カラム追加必須
- フロントエンドで `localStorage` または `sessionStorage` による session_id 管理
- 要件4 (検索履歴保存) の実装戦略確定

**セキュリティ考慮事項**:
- 匿名ユーザーの履歴はブラウザセッションに紐付け (クロスデバイス非対応)
- 将来的な認証機能追加時の移行パス検討必要

---

## 4. 技術スタック妥当性検証

### 4.1 無料枠制約分析

**調査日**: 2025-11-11
**目的**: React + Cloudflare + Supabase スタックの無料枠運用可能性確認

**調査結果**:

| サービス | 無料枠制限 | 想定月間使用量 | 妥当性 |
|---------|----------|--------------|--------|
| Cloudflare Workers | 100,000 req/日 (3M/月) | 1,000 req/月 | ✅ 十分 |
| Cloudflare Pages | 無制限帯域幅 | 可変 | ✅ 制限なし |
| Supabase Database | 500MB ストレージ | <50MB (初期) | ✅ 十分 |
| Supabase Bandwidth | 10GB/月 | ~1GB/月 (Workers KV併用) | ✅ 問題なし |

**代替案比較** (Firebase + TiDB + Cloudflare):
- TiDB: 5GB ストレージ (Supabase比10倍) だが、アーキテクチャ複雑化
- Firebase App Hosting: 10GB/月帯域幅制限 (Pages比で劣る)
- 管理プラットフォーム: 3つ (Firebase + TiDB + Cloudflare) vs 2つ (Cloudflare + Supabase)

**結論**: ✅ 現行スタック (Cloudflare + Supabase) を継続採用
- Cloudflare Pages の無制限帯域幅が決定的優位性
- Workers KV キャッシュ戦略でSupabase帯域幅を最小化可能

**帯域幅削減戦略**:
1. HeartRails 全駅一覧を Workers KV に24時間キャッシュ
2. Supabase への直接クエリは検索履歴保存/取得のみに限定
3. 静的アセットは Pages CDN から配信 (Supabase帯域幅未使用)

---

## 5. リスクと制約事項

### 5.1 技術的リスク

| リスク項目 | 影響度 | 軽減策 | ステータス |
|----------|--------|--------|----------|
| ジョルダンAPI未提供 | 🔴 高 | 外部リンク方式でMVP実装 | 対策済み |
| Supabase帯域幅超過 | 🟡 中 | Workers KVキャッシュ導入 | 設計反映 |
| HeartRails API廃止 | 🟡 中 | 駅データローカルキャッシュ | 将来対応 |
| 位置情報取得失敗 | 🟢 低 | 手動入力フォールバック | 設計反映 |

### 5.2 外部依存関係

| 依存先 | 用途 | 代替手段 | 安定性評価 |
|-------|------|---------|----------|
| HeartRails Express API | 駅情報取得 | 駅データJSONローカル管理 | 🟢 安定 (2021年以降稼働) |
| ジョルダンWebサイト | 経路検索リンク | Google Maps Directions | 🟡 外部依存 |
| Supabase | データ永続化 | なし (アーキテクチャ変更必要) | 🟢 商用サービス |
| Cloudflare | ホスティング・API実行 | Vercel/Netlify | 🟢 エンタープライズ級 |

---

## 6. 次のステップ

1. ✅ **完了**: 外部依存関係調査
2. 🔄 **進行中**: 設計文書生成 (design.md)
3. ⏳ **未着手**: タスク分解 (`/kiro:spec-tasks`)
4. ⏳ **未着手**: 実装フェーズ (`/kiro:spec-impl`)

---

## 7. 参考資料

- HeartRails Express API: http://express.heartrails.com/
- Hono CORS Middleware: https://hono.dev/middleware/builtin/cors
- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- React Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- Cloudflare Workers Pricing: https://developers.cloudflare.com/workers/platform/pricing/

---

**調査担当**: Claude (Kiro Framework)
**承認**: 未承認 (設計文書と共にレビュー待ち)
