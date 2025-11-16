/**
 * API型定義
 */

export interface Station {
  name: string;
  prefecture: string;
  line: string;
  latitude: number;
  longitude: number;
}

export interface StationsResponse {
  stations: Station[];
}

export interface Journey {
  departure: {
    name: string;
    yomi: string;
    prefecture: string;
    latitude?: number;
    longitude?: number;
  };
  destination: {
    name: string;
    yomi: string;
    prefecture: string;
    latitude?: number;
    longitude?: number;
  };
  jorudanLink: string;
}

export interface JourneyRequest {
  departureStation: string;
  distanceRange?: {
    min?: number;
    max?: number;
  };
  direction?: 'north' | 'south' | 'east' | 'west';
  excludePrefectures?: string[];
}

export interface ApiError {
  error: string;
  message: string;
  suggestion?: string;
}
