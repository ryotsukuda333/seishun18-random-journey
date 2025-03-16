import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { destinationsHandler } from './handlers/destinations';
import { randomDestinationHandler } from './handlers/randomDestination';

// 環境変数の型定義
interface Env {
    DB: D1Database;
    ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORSの設定
app.use('*', cors({
    origin: ['http://localhost:3000', 'https://randomjourney.example.com'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86400,
}));

// ヘルスチェックエンドポイント
app.get('/', (c) => {
    return c.json({
        status: 'ok',
        version: '0.1.0',
        environment: c.env.ENVIRONMENT,
    });
});

// APIルート
app.get('/destinations', destinationsHandler);
app.get('/destinations/:id', destinationsHandler);
app.get('/random-destination', randomDestinationHandler);

// エラーハンドリング
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({
        error: {
            message: 'Internal Server Error',
        }
    }, 500);
});

// 404ハンドリング
app.notFound((c) => {
    return c.json({
        error: {
            message: 'Not Found',
        }
    }, 404);
});

export default app; 