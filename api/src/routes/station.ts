/**
 * Station API Routes
 * 駅情報取得エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import { searchStationByName } from '../services/ekispert';
import { generateCacheKey, getCache, setCache } from '../utils/cache';

const app = new Hono<{ Bindings: Env }>();

// POST /api/station/nearest - 座標から最寄り駅を取得
// 注: 駅すぱあとAPIでは座標からの駅検索は未対応のためコメントアウト
/*
const nearestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

app.post('/nearest', zValidator('json', nearestSchema), async (c) => {
  return c.json(
    {
      error: 'NOT_SUPPORTED',
      message: '座標からの駅検索は現在サポートされていません',
    },
    501
  );
});
*/

// GET /api/station/search - 駅名で検索
const searchSchema = z.object({
  name: z.string().min(1).max(50),
});

app.get('/search', zValidator('query', searchSchema), async (c) => {
  const { name } = c.req.valid('query');

  // キャッシュキー生成
  const cacheKey = generateCacheKey('station:search', { name });

  // キャッシュチェック
  const cached = await getCache(c.env.STATION_CACHE, cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const stations = await searchStationByName(c.env.EKISPERT_API_KEY, name);

    if (stations.length === 0) {
      return c.json(
        {
          error: 'STATION_NOT_FOUND',
          message: '該当する駅が見つかりませんでした',
        },
        404
      );
    }

    const response = {
      stations: stations.slice(0, 20), // 最大20件
    };

    // キャッシュ保存 (24時間)
    await setCache(c.env.STATION_CACHE, cacheKey, response, 86400);

    return c.json(response);
  } catch (error) {
    console.error('Ekispert API error:', error);
    return c.json(
      {
        error: 'EXTERNAL_API_ERROR',
        message: '駅情報の取得に失敗しました',
      },
      500
    );
  }
});

export default app;
