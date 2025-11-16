/**
 * 駅すぱあと API Service
 * 駅・路線情報取得、経路探索のためのサービス層
 */

export interface Line {
  code: string; // 運行線コード (operationLineCode)
  Name: string;
  Type: {
    text: string;
    detail: string;
  };
  Color?: string;
}

export interface Station {
  code: string;
  Name: string;
  Yomi: string;
  Type: string;
  Prefecture: {
    code: string;
    Name: string;
  };
  GeoPoint?: {
    lati_d: string;
    longi_d: string;
    gcs: string;
  };
}

export interface RouteResult {
  timeOnBoard: number; // 乗車時間（分）
  transferCount: number; // 乗り換え回数
  fare: string; // 運賃
  lines: string[]; // 利用路線名リスト
}

interface RailResponse {
  ResultSet: {
    apiVersion: string;
    engineVersion: string;
    max: number;
    offset: number;
    Line?: Line[];
  };
}

interface StationResponse {
  ResultSet: {
    apiVersion: string;
    engineVersion: string;
    max: number;
    offset: number;
    Point?: Array<{
      Station: {
        code: string;
        Name: string;
        Yomi: string;
        Type: string;
      };
      Prefecture: {
        code: string;
        Name: string;
      };
      GeoPoint?: {
        lati_d: string;
        longi_d: string;
        lati: string;
        longi: string;
        gcs: string;
      };
    }>;
  };
}

interface ConditionResponse {
  ResultSet: {
    apiVersion: string;
    engineVersion: string;
    Condition: string;
  };
}

interface CourseResponse {
  ResultSet: {
    apiVersion: string;
    engineVersion: string;
    Course?: Array<{
      Price?: Array<{
        kind: string;
        Oneway?: string;
      }>;
      Route: {
        timeOnBoard: number;
        transferCount: number;
        Line?: Array<{
          Name: string;
        }>;
      };
    }>;
  };
}

const API_BASE_URL = 'https://api.ekispert.jp/v1/json';

/**
 * JR運行線一覧を取得
 * @param apiKey 駅すぱあとAPIキー
 * @returns JR運行線の配列
 */
export async function fetchJRLines(apiKey: string): Promise<any[]> {
  const url = `${API_BASE_URL}/operationLine?key=${apiKey}&corporationName=${encodeURIComponent(
    'ＪＲ'
  )}&limit=100`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: any = await response.json();

  if (!data.ResultSet || !data.ResultSet.Line) {
    return [];
  }

  return data.ResultSet.Line;
}

/**
 * 運行線の駅一覧を取得
 * @param apiKey 駅すぱあとAPIキー
 * @param operationLineCode 運行線コード
 * @returns 駅情報の配列
 */
export async function fetchStationsByLine(
  apiKey: string,
  operationLineCode: string
): Promise<Station[]> {
  const url = `${API_BASE_URL}/station?key=${apiKey}&operationLineCode=${operationLineCode}&gcs=wgs84&limit=100`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: StationResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Point) {
    return [];
  }

  // Point may be a single object or an array
  const points = Array.isArray(data.ResultSet.Point)
    ? data.ResultSet.Point
    : [data.ResultSet.Point];

  return points.map((point) => ({
    code: point.Station.code,
    Name: point.Station.Name,
    Yomi: point.Station.Yomi,
    Type: point.Station.Type,
    Prefecture: point.Prefecture,
    GeoPoint: point.GeoPoint,
  }));
}

/**
 * 駅名で駅情報を検索（サジェスト用）
 * @param apiKey 駅すぱあとAPIキー
 * @param stationName 駅名
 * @returns 駅情報の配列
 */
export async function searchStationLight(
  apiKey: string,
  stationName: string
): Promise<Station[]> {
  // /station/light エンドポイントを使用（サジェスト用の軽量版）
  const url = `${API_BASE_URL}/station/light?key=${apiKey}&name=${encodeURIComponent(
    stationName
  )}&type=train&gcs=wgs84`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: StationResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Point) {
    return [];
  }

  // Point may be a single object or an array
  const points = Array.isArray(data.ResultSet.Point)
    ? data.ResultSet.Point
    : [data.ResultSet.Point];

  return points.map((point) => ({
    code: point.Station.code,
    Name: point.Station.Name,
    Yomi: point.Station.Yomi,
    Type: point.Station.Type,
    Prefecture: point.Prefecture,
    GeoPoint: point.GeoPoint,
  }));
}

/**
 * 駅名で駅情報を検索（詳細版）
 * @param apiKey 駅すぱあとAPIキー
 * @param stationName 駅名
 * @returns 駅情報の配列
 */
export async function searchStationByName(
  apiKey: string,
  stationName: string
): Promise<Station[]> {
  const url = `${API_BASE_URL}/station?key=${apiKey}&name=${encodeURIComponent(
    stationName
  )}&type=train&gcs=wgs84&limit=100`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: StationResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Point) {
    return [];
  }

  // Point may be a single object or an array
  const points = Array.isArray(data.ResultSet.Point)
    ? data.ResultSet.Point
    : [data.ResultSet.Point];

  return points.map((point) => ({
    code: point.Station.code,
    Name: point.Station.Name,
    Yomi: point.Station.Yomi,
    Type: point.Station.Type,
    Prefecture: point.Prefecture,
    GeoPoint: point.GeoPoint,
  }));
}

/**
 * 座標から最寄り駅を検索
 * @param apiKey 駅すぱあとAPIキー
 * @param latitude 緯度
 * @param longitude 経度
 * @returns 駅情報の配列
 */
export async function fetchNearestStation(
  apiKey: string,
  latitude: number,
  longitude: number
): Promise<Station[]> {
  // Ekispert API: /station/light?geoPoint=経度,緯度
  const url = `${API_BASE_URL}/station/light?key=${apiKey}&geoPoint=${longitude},${latitude}&gcs=wgs84&limit=10`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: StationResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Point) {
    return [];
  }

  // Point may be a single object or an array
  const points = Array.isArray(data.ResultSet.Point)
    ? data.ResultSet.Point
    : [data.ResultSet.Point];

  return points.map((point) => ({
    code: point.Station.code,
    Name: point.Station.Name,
    Yomi: point.Station.Yomi,
    Type: point.Station.Type,
    Prefecture: point.Prefecture,
    GeoPoint: point.GeoPoint,
  }));
}

/**
 * 探索条件生成（普通列車のみ）
 * @param apiKey 駅すぱあとAPIキー
 * @returns 探索条件文字列
 */
export async function generateLocalTrainCondition(
  apiKey: string
): Promise<string> {
  const params = new URLSearchParams({
    key: apiKey,
    plane: 'never',
    shinkansen: 'never',
    limitedExpress: 'never',
    highwayBus: 'never',
    connectionBus: 'never',
    localBus: 'never',
    ship: 'never',
  });

  const url = `${API_BASE_URL}/toolbox/course/condition?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: ConditionResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Condition) {
    throw new Error('Condition generation failed');
  }

  return data.ResultSet.Condition;
}

/**
 * 経路探索
 * @param apiKey 駅すぱあとAPIキー
 * @param departureCode 出発駅コード
 * @param destinationCode 到着駅コード
 * @param conditionDetail 探索条件
 * @returns 経路情報
 */
export async function searchRoute(
  apiKey: string,
  departureCode: string,
  destinationCode: string,
  conditionDetail: string
): Promise<RouteResult> {
  const viaList = `${departureCode}:${destinationCode}`;
  // フリープランでは /search/course/plain を使用
  let url = `${API_BASE_URL}/search/course/plain?key=${apiKey}&viaList=${encodeURIComponent(
    viaList
  )}`;

  // conditionDetailが指定されている場合のみ追加
  if (conditionDetail) {
    url += `&conditionDetail=${encodeURIComponent(conditionDetail)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ekispert API error: ${response.status}`);
  }

  const data: CourseResponse = await response.json();

  if (!data.ResultSet || !data.ResultSet.Course || data.ResultSet.Course.length === 0) {
    throw new Error('No route found');
  }

  const course = data.ResultSet.Course[0];
  const route = course.Route;

  // 運賃情報を取得
  let fare = '不明';
  if (course.Price && course.Price.length > 0) {
    const fareInfo = course.Price.find((p) => p.kind === 'FareSummary');
    if (fareInfo && fareInfo.Oneway) {
      fare = `${fareInfo.Oneway}円`;
    }
  }

  // 利用路線名を取得
  const lines: string[] = [];
  if (route.Line) {
    route.Line.forEach((line) => {
      lines.push(line.Name);
    });
  }

  return {
    timeOnBoard: route.timeOnBoard,
    transferCount: route.transferCount,
    fare,
    lines,
  };
}
