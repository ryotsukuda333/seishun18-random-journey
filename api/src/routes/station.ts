/**
 * Station API Routes
 * 駅情報取得エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import { fetchNearestStation, searchStationByName } from '../services/heartrails';
import { generateCacheKey, getCache, setCache } from '../utils/cache';

const app = new Hono<{ Bindings: Env }>();

// POST /api/station/nearest - 座標から最寄り駅を取得
const nearestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

app.post('/nearest', zValidator('json', nearestSchema), async (c) => {
  const { latitude, longitude } = c.req.valid('json');

  // キャッシュキー生成 (小数点2桁丸め)
  const lat = Math.round(latitude * 100) / 100;
  const lng = Math.round(longitude * 100) / 100;
  const cacheKey = generateCacheKey('station:nearest', {
    lat: lat.toString(),
    lng: lng.toString(),
  });

  // キャッシュチェック
  const cached = await getCache(c.env.STATION_CACHE, cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const stations = await fetchNearestStation(latitude, longitude);

    if (stations.length === 0) {
      return c.json(
        {
          error: 'STATION_NOT_FOUND',
          message: '指定された座標の近くに駅が見つかりませんでした',
        },
        404
      );
    }

    const response = {
      stations: stations.slice(0, 5), // 最大5件
    };

    // キャッシュ保存 (24時間)
    await setCache(c.env.STATION_CACHE, cacheKey, response, 86400);

    return c.json(response);
  } catch (error) {
    console.error('HeartRails API error:', error);
    return c.json(
      {
        error: 'EXTERNAL_API_ERROR',
        message: '駅情報の取得に失敗しました',
      },
      500
    );
  }
});

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
    const stations = await searchStationByName(name);

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
    console.error('HeartRails API error:', error);
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
