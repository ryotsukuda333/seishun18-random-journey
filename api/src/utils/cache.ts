/**
 * Workers KV Cache Utilities
 * 駅情報のキャッシュ管理
 */

import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * キャッシュキーを生成
 * @param prefix プレフィックス
 * @param params パラメータ
 * @returns キャッシュキー
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}

/**
 * KVからキャッシュ取得
 * @param kv KVNamespace
 * @param key キャッシュキー
 * @returns キャッシュされたデータ (JSON) または null
 */
export async function getCache<T>(
  kv: KVNamespace,
  key: string
): Promise<T | null> {
  const cached = await kv.get(key, 'text');
  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * KVにキャッシュ保存
 * @param kv KVNamespace
 * @param key キャッシュキー
 * @param value 保存するデータ
 * @param ttlSeconds TTL (秒単位, デフォルト: 24時間)
 */
export async function setCache<T>(
  kv: KVNamespace,
  key: string,
  value: T,
  ttlSeconds: number = 86400 // 24時間
): Promise<void> {
  await kv.put(key, JSON.stringify(value), {
    expirationTtl: ttlSeconds,
  });
}

/**
 * レート制限チェック (IP別)
 * @param kv KVNamespace
 * @param ip IPアドレス
 * @param limit 制限回数
 * @param windowSeconds ウィンドウ時間 (秒)
 * @returns 制限超過の場合 true
 */
export async function isRateLimited(
  kv: KVNamespace,
  ip: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `rate:${ip}`;
  const current = await kv.get(key, 'text');

  if (!current) {
    // 初回アクセス
    await kv.put(key, '1', { expirationTtl: windowSeconds });
    return false;
  }

  const count = parseInt(current, 10);
  if (count >= limit) {
    return true;
  }

  // カウント増加
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return false;
}
