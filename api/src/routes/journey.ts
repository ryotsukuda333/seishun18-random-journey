/**
 * Journey API Routes
 * ランダム旅行生成エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import { searchStationByName, fetchNearestStation } from '../services/heartrails';
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

    // ランダムな座標を生成して駅を探す
    const maxAttempts = 50;
    const candidates = [];

    for (let i = 0; i < maxAttempts; i++) {
      // 日本の緯度経度の範囲内でランダム座標生成
      // 北緯24度～45度、東経123度～145度
      const randomLat = Math.random() * (45 - 24) + 24;
      const randomLng = Math.random() * (145 - 123) + 123;

      try {
        // ランダム座標から最寄り駅を取得
        const stations = await fetchNearestStation(randomLat, randomLng);

        if (stations.length === 0) continue;

        const station = stations[0];

        // 出発駅と同じ駅は除外
        if (station.name === departure.name && station.prefecture === departure.prefecture) {
          continue;
        }

        // 距離計算
        const distance = calculateDistance(
          departure.latitude,
          departure.longitude,
          station.latitude,
          station.longitude
        );

        // 距離フィルタリング
        if (distanceRange) {
          if (distanceRange.min && distance < distanceRange.min) continue;
          if (distanceRange.max && distance > distanceRange.max) continue;
        }

        // 方角フィルタリング
        if (direction) {
          const stationDirection = calculateDirection(
            departure.latitude,
            departure.longitude,
            station.latitude,
            station.longitude
          );
          if (stationDirection !== direction) continue;
        }

        // 都道府県除外フィルタリング
        if (excludePrefectures && excludePrefectures.includes(station.prefecture)) {
          continue;
        }

        candidates.push(station);
      } catch (error) {
        // APIエラーは無視して次の座標を試す
        continue;
      }
    }

    // 重複削除
    const uniqueCandidates = candidates.filter((station, index, self) =>
      index === self.findIndex((s) =>
        s.name === station.name && s.prefecture === station.prefecture
      )
    );

    if (uniqueCandidates.length === 0) {
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
    const destination = getRandomElement(uniqueCandidates);
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const jorudanLink = `https://www.jorudan.co.jp/norikae/cgi/nori.cgi?` +
      `eki1=${encodeURIComponent(departureStation)}` +
      `&eki2=${encodeURIComponent(destination.name)}` +
      `&via_on=-1` +
      `&eki3=&eki4=&eki5=&eki6=` +
      `&Dyy=${year}` +
      `&Dmm=${month}` +
      `&Ddd=${day}` +
      `&Dhh=${hour}` +
      `&Dmn1=${Math.floor(minute / 10)}` +
      `&Dmn2=${minute % 10}` +
      `&Cway=0` +
      `&Cfp=1` +
      `&Czu=2` +
      `&C7=1` +
      `&C2=0` +
      `&C3=0` +
      `&C1=0` +
      `&sort=rec` +
      `&C4=5` +
      `&C5=0` +
      `&C6=2` +
      `&S=${encodeURIComponent('検索')}` +
      `&Cmap1=` +
      `&rf=nr` +
      `&pg=1` +
      `&eok1=&eok2=&eok3=&eok4=&eok5=&eok6=` +
      `&Csg=1`;

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
