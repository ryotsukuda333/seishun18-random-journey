/**
 * HeartRails Express API Service
 * 駅情報取得のためのサービス層
 */

export interface Station {
  name: string;
  prefecture: string;
  line: string;
  latitude: number;
  longitude: number;
}

export interface NearestStationResponse {
  response: {
    station: Station[];
  };
}

export interface StationSearchResponse {
  response: {
    station: Station[];
  };
}

/**
 * 位置情報から最寄り駅を取得
 * @param latitude 緯度
 * @param longitude 経度
 * @returns 駅情報配列
 */
export async function fetchNearestStation(
  latitude: number,
  longitude: number
): Promise<Station[]> {
  const url = `http://express.heartrails.com/api/json?method=getStations&x=${longitude}&y=${latitude}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Seishun18-Random-Journey/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HeartRails API error: ${response.status}`);
  }

  const data: NearestStationResponse = await response.json();

  if (!data.response || !data.response.station) {
    return [];
  }

  return data.response.station.map((s) => ({
    name: s.name,
    prefecture: s.prefecture,
    line: s.line,
    latitude: Number(s.latitude),
    longitude: Number(s.longitude),
  }));
}

/**
 * 駅名で駅情報を検索
 * @param name 駅名 (部分一致)
 * @returns 駅情報配列
 */
export async function searchStationByName(name: string): Promise<Station[]> {
  const url = `http://express.heartrails.com/api/json?method=getStations&name=${encodeURIComponent(
    name
  )}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Seishun18-Random-Journey/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HeartRails API error: ${response.status}`);
  }

  const data: StationSearchResponse = await response.json();

  if (!data.response || !data.response.station) {
    return [];
  }

  return data.response.station.map((s) => ({
    name: s.name,
    prefecture: s.prefecture,
    line: s.line,
    latitude: Number(s.latitude),
    longitude: Number(s.longitude),
  }));
}
