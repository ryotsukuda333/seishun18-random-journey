import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Environment type definition
export type Env = {
  FRONTEND_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  STATION_CACHE: KVNamespace;
  JOURNEY_RATE_LIMIT: KVNamespace;
  STATION_SEARCH_RATE_LIMIT: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware: CORS
app.use('/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_ORIGIN,
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'x-session-id'],
  });
  return corsMiddleware(c, next);
});

// Middleware: Logger (minimal logging without personal info)
app.use('/*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added here
// TODO: Add route handlers for:
// - POST /api/station/nearest
// - GET /api/station/search
// - POST /api/journey/random
// - GET /api/announcements

app.notFound((c) => {
  return c.json({ error: 'NOT_FOUND', message: 'Endpoint not found' }, 404);
});

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    500
  );
});

export default app;
