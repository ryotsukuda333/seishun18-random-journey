import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import stationRoutes from './routes/station';
import journeyRoutes from './routes/journey';

// Environment type definition
export type Env = {
  FRONTEND_ORIGIN: string;
  EKISPERT_API_KEY: string;
  STATION_CACHE: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware: CORS
app.use('/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_ORIGIN,
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  });
  return corsMiddleware(c, next);
});

// Middleware: Logger (minimal logging without personal info)
app.use('/*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/station', stationRoutes);
app.route('/api/journey', journeyRoutes);

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
