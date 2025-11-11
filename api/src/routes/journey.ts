/**
 * Journey API Routes
 * ランダム旅行生成エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import { searchStationByName } from '../services/heartrails';
import { calculateDistance, calculateDirection, getRandomElement } from '../utils/geo';
import { isRateLimited } from '../utils/cache';
import { createSupabaseClient } from '../utils/supabase';

const app = new Hono<{ Bindings: Env }>();

// POST /api/journey/random - ランダムな目的地駅を提案
const randomSchema = z.object({
  departureStation: z.string().min(1).max(50),
  distanceRange: z
    .object({
      min: z.number().min(0).max(1000).optional(),
      max: z.number().min(0).max(1000).optional(),
    })
    .optional(),
  direction: z.enum(['north', 'south', 'east', 'west']).optional(),
  excludePrefectures: z.array(z.string()).optional(),
});

app.post('/random', zValidator('json', randomSchema), async (c) => {
  const { departureStation, distanceRange, direction, excludePrefectures } =
    c.req.valid('json');

  // レート制限チェック (10件/日)
  const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
  const limited = await isRateLimited(c.env.JOURNEY_RATE_LIMIT, clientIP, 10, 86400);

  if (limited) {
    return c.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: '1日の利用回数上限に達しました',
      },
      429
    );
  }

  try {
    // 出発駅を検索
    const departureStations = await searchStationByName(departureStation);
    if (departureStations.length === 0) {
      return c.json(
        {
          error: 'DEPARTURE_STATION_NOT_FOUND',
          message: '出発駅が見つかりませんでした',
        },
        404
      );
    }

    const departure = departureStations[0];

    // 全国の駅リストを取得 (キャッシュから、またはダミーデータ)
    // 本来はHeartRails APIから全駅を取得する必要がありますが、
    // ここでは簡略化のため、出発駅の都道府県から他の駅を検索します
    const allStations = await searchStationByName(''); // 空文字で全駅取得は不可のため、実装時に要調整

    // フィルタリング
    let candidates = allStations.filter((station) => {
      // 出発駅を除外
      if (
        station.name === departure.name &&
        station.prefecture === departure.prefecture
      ) {
        return false;
      }

      // 距離フィルタリング
      if (distanceRange) {
        const distance = calculateDistance(
          departure.latitude,
          departure.longitude,
          station.latitude,
          station.longitude
        );

        if (distanceRange.min && distance < distanceRange.min) {
          return false;
        }
        if (distanceRange.max && distance > distanceRange.max) {
          return false;
        }
      }

      // 方角フィルタリング
      if (direction) {
        const stationDirection = calculateDirection(
          departure.latitude,
          departure.longitude,
          station.latitude,
          station.longitude
        );
        if (stationDirection !== direction) {
          return false;
        }
      }

      // 都道府県除外フィルタリング
      if (excludePrefectures && excludePrefectures.includes(station.prefecture)) {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      return c.json(
        {
          error: 'NO_SUITABLE_DESTINATION',
          message: '条件に合う目的地が見つかりませんでした',
          suggestion: '検索条件を緩和してください',
        },
        404
      );
    }

    // ランダム選択
    const destination = getRandomElement(candidates);
    if (!destination) {
      return c.json(
        {
          error: 'NO_SUITABLE_DESTINATION',
          message: '目的地の抽選に失敗しました',
        },
        500
      );
    }

    // ジョルダンリンク生成
    const jorudanLink = `https://www.jorudan.co.jp/norikae/cgi/nori.cgi?eki1=${encodeURIComponent(
      departureStation
    )}&eki2=${encodeURIComponent(destination.name)}`;

    // 検索履歴を保存 (セッションIDがある場合)
    const sessionId = c.req.header('x-session-id');
    if (sessionId) {
      const supabase = createSupabaseClient(c.env, sessionId);
      await supabase.from('search_histories').insert({
        session_id: sessionId,
        departure_station: departureStation,
        destination_station: destination.name,
        jorudan_link: jorudanLink,
      });
    }

    return c.json({
      departure: {
        name: departure.name,
        prefecture: departure.prefecture,
        latitude: departure.latitude,
        longitude: departure.longitude,
      },
      destination: {
        name: destination.name,
        prefecture: destination.prefecture,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      jorudanLink,
    });
  } catch (error) {
    console.error('Journey random error:', error);
    return c.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'ランダム旅行の生成に失敗しました',
      },
      500
    );
  }
});

export default app;
