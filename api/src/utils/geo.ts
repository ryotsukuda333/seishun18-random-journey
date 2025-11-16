/**
 * Geolocation Utilities
 * 地理座標計算ユーティリティ
 */

/**
 * Haversine公式を使用して2点間の距離を計算
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離 (km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 度数法から弧度法へ変換
 * @param degrees 度数
 * @returns 弧度
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 2点間の方角を計算
 * @param lat1 出発点の緯度
 * @param lon1 出発点の経度
 * @param lat2 目的地の緯度
 * @param lon2 目的地の経度
 * @returns 方角 ('north' | 'south' | 'east' | 'west')
 */
export function calculateDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): 'north' | 'south' | 'east' | 'west' {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  // 緯度差が大きい場合
  if (Math.abs(dLat) > Math.abs(dLon)) {
    return dLat > 0 ? 'north' : 'south';
  }

  // 経度差が大きい場合
  return dLon > 0 ? 'east' : 'west';
}

/**
 * ランダムな配列要素を取得
 * @param array 配列
 * @returns ランダムな要素
 */
export function getRandomElement<T>(array: T[]): T | null {
  if (array.length === 0) {
    return null;
  }
  return array[Math.floor(Math.random() * array.length)];
}
