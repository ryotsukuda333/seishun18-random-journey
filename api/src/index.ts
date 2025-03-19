import { Hono } from 'hono';
import { cors } from 'hono/cors';

// 環境変数の型定義
type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  API_CACHE_TTL: string;
  ALLOW_ORIGINS: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORSミドルウェア
app.use('/*', cors({
  origin: (origin) => {
    // ALLOW_ORIGINSをカンマ区切りで分割して配列に変換
    const allowedOrigins = app.env?.ALLOW_ORIGINS ? app.env.ALLOW_ORIGINS.split(',') : [];
    // originが許可リストにあるか、開発環境なら許可
    return allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') ? origin : '';
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// ヘルスチェック用ルート
app.get('/', (c) => {
  return c.json({
    message: 'Seishun18 Random Journey API',
    status: 'running',
  });
});

// 最寄り駅を取得するエンドポイント (実装は後ほど)
app.get('/api/nearby-station', (c) => {
  return c.json({ message: 'この機能はまだ実装されていません' });
});

// ランダムな駅を取得するエンドポイント (実装は後ほど)
app.get('/api/random-station', (c) => {
  return c.json({ message: 'この機能はまだ実装されていません' });
});

// 経路検索エンドポイント (実装は後ほど)
app.get('/api/route', (c) => {
  return c.json({ message: 'この機能はまだ実装されていません' });
});

// 共有エンドポイント (実装は後ほど)
app.post('/api/share', (c) => {
  return c.json({ message: 'この機能はまだ実装されていません' });
});

export default app;