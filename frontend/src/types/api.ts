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
    prefecture: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    prefecture: string;
    latitude: number;
    longitude: number;
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance';
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
}

export interface ApiError {
  error: string;
  message: string;
  suggestion?: string;
}
