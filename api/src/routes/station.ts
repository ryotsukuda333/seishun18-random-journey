/**
 * Station API Routes
 * 駅情報取得エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import { searchStationByName, searchStationLight, fetchNearestStation } from '../services/ekispert';
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
    const stations = await fetchNearestStation(c.env.EKISPERT_API_KEY, latitude, longitude);

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

// GET /api/station/suggest - 駅名サジェスト（軽量版）
const suggestSchema = z.object({
  name: z.string().min(1).max(50),
});

app.get('/suggest', zValidator('query', suggestSchema), async (c) => {
  const { name } = c.req.valid('query');

  // キャッシュキー生成
  const cacheKey = generateCacheKey('station:suggest:v2', { name }); // v2で新しいキャッシュキーに変更

  // キャッシュチェック
  const cached = await getCache(c.env.STATION_CACHE, cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const stations = await searchStationLight(c.env.EKISPERT_API_KEY, name);

    const response = {
      stations: stations.slice(0, 10), // 最大10件
    };

    // キャッシュ保存 (24時間)
    await setCache(c.env.STATION_CACHE, cacheKey, response, 86400);

    return c.json(response);
  } catch (error) {
    console.error('Ekispert API error:', error);
    return c.json({ stations: [] }); // エラー時は空配列を返す
  }
});

export default app;
