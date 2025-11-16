/**
 * Journey API Routes
 * ランダム旅行生成エンドポイント
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';
import {
  fetchJRLines,
  fetchStationsByLine,
  searchStationByName,
} from '../services/ekispert';
import { calculateDistance, calculateDirection, getRandomElement } from '../utils/geo';
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

  try {
    // 1. 出発駅を検索
    const departureStations = await searchStationByName(
      c.env.EKISPERT_API_KEY,
      departureStation
    );

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

    // 2. JR路線一覧を取得（キャッシュなしで毎回APIから）
    const lines = await fetchJRLines(c.env.EKISPERT_API_KEY);

    if (!Array.isArray(lines) || lines.length === 0) {
      return c.json(
        {
          error: 'NO_LINES_FOUND',
          message: 'JR路線情報の取得に失敗しました',
        },
        500
      );
    }

    // 3. ランダムにJR路線を選択
    const randomLine = getRandomElement(lines);

    // 4. 選択した路線の駅一覧を取得（KVキャッシュから取得、なければAPIから）
    const cacheKey = `stations_${randomLine.code}`;
    let allStations = await c.env.STATION_CACHE.get(cacheKey, 'json');
    if (!allStations) {
      allStations = await fetchStationsByLine(c.env.EKISPERT_API_KEY, randomLine.code);
      await c.env.STATION_CACHE.put(cacheKey, JSON.stringify(allStations), {
        expirationTtl: 86400, // 24時間
      });
    }

    if (!Array.isArray(allStations) || allStations.length === 0) {
      return c.json(
        {
          error: 'NO_STATIONS_FOUND',
          message: '駅情報の取得に失敗しました',
        },
        500
      );
    }

    // 5. 出発駅以外の駅をフィルタリング
    let candidates = allStations.filter((s: any) => s.code !== departure.code);

    // 6. 距離フィルタリング（緯度経度がある場合）
    if (distanceRange && departure.GeoPoint) {
      const departureLat = Number(departure.GeoPoint.lati_d);
      const departureLng = Number(departure.GeoPoint.longi_d);

      candidates = candidates.filter((s: any) => {
        if (!s.GeoPoint) return false;

        const stationLat = Number(s.GeoPoint.lati_d);
        const stationLng = Number(s.GeoPoint.longi_d);

        const distance = calculateDistance(
          departureLat,
          departureLng,
          stationLat,
          stationLng
        );

        if (distanceRange.min && distance < distanceRange.min) return false;
        if (distanceRange.max && distance > distanceRange.max) return false;

        return true;
      });
    }

    // 7. 方角フィルタリング
    if (direction && departure.GeoPoint) {
      const departureLat = Number(departure.GeoPoint.lati_d);
      const departureLng = Number(departure.GeoPoint.longi_d);

      candidates = candidates.filter((s: any) => {
        if (!s.GeoPoint) return false;

        const stationLat = Number(s.GeoPoint.lati_d);
        const stationLng = Number(s.GeoPoint.longi_d);

        const stationDirection = calculateDirection(
          departureLat,
          departureLng,
          stationLat,
          stationLng
        );

        return stationDirection === direction;
      });
    }

    // 8. 都道府県除外フィルタリング
    if (excludePrefectures && excludePrefectures.length > 0) {
      candidates = candidates.filter(
        (s: any) => !excludePrefectures.includes(s.Prefecture.Name)
      );
    }

    // 9. 条件に合う駅が見つからない場合
    if (candidates.length === 0) {
      return c.json(
        {
          error: 'NO_DESTINATION_FOUND',
          message: '条件に合う目的地が見つかりませんでした',
        },
        404
      );
    }

    // 10. ランダムに目的地駅を選択
    const destination = getRandomElement(candidates);

    // 13. ジョルダンリンク生成
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const jorudanLink =
      `https://www.jorudan.co.jp/norikae/cgi/nori.cgi?` +
      `eki1=${encodeURIComponent(departure.Name)}` +
      `&eki2=${encodeURIComponent(destination.Name)}` +
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

    // 14. 検索履歴を保存 (セッションIDがある場合)
    const sessionId = c.req.header('x-session-id');
    if (sessionId) {
      const supabase = createSupabaseClient(c.env, sessionId);
      await supabase.from('search_histories').insert({
        session_id: sessionId,
        departure_station: departure.Name,
        destination_station: destination.Name,
        jorudan_link: jorudanLink,
      });
    }

    // 15. レスポンス返却
    return c.json({
      departure: {
        name: departure.Name,
        yomi: departure.Yomi || '',
        prefecture: departure.Prefecture.Name,
        latitude: departure.GeoPoint?.lati_d,
        longitude: departure.GeoPoint?.longi_d,
      },
      destination: {
        name: destination.Name,
        yomi: destination.Yomi || '',
        prefecture: destination.Prefecture.Name,
        latitude: destination.GeoPoint?.lati_d,
        longitude: destination.GeoPoint?.longi_d,
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
