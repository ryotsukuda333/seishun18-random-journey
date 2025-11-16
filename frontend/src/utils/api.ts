/**
 * API Client Utilities
 */

import type {
  StationsResponse,
  Journey,
  JourneyRequest,
  ApiError,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

/**
 * API共通リクエストヘッダー
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * APIエラーハンドリング
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || 'リクエストに失敗しました');
  }
  return response.json();
}

/**
 * 座標から最寄り駅を取得
 */
export async function fetchNearestStation(
  latitude: number,
  longitude: number
): Promise<StationsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/station/nearest`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ latitude, longitude }),
  });
  return handleResponse<StationsResponse>(response);
}

/**
 * 駅名で検索
 */
export async function searchStation(name: string): Promise<StationsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/station/search?name=${encodeURIComponent(name)}`,
    {
      headers: getHeaders(),
    }
  );
  return handleResponse<StationsResponse>(response);
}

/**
 * 駅名サジェスト（軽量版）
 */
export async function suggestStation(name: string): Promise<StationsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/station/suggest?name=${encodeURIComponent(name)}`,
    {
      headers: getHeaders(),
    }
  );
  return handleResponse<StationsResponse>(response);
}

/**
 * ランダムな目的地を取得
 */
export async function fetchRandomJourney(
  request: JourneyRequest
): Promise<Journey> {
  const response = await fetch(`${API_BASE_URL}/api/journey/random`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<Journey>(response);
}
