export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Connector {
  type: string; // e.g., "CCS", "CHAdeMO", "Type 2"
  power: string; // e.g., "50kW", "150kW"
  available: number;
  total: number;
  price: string;
}

// Structured station data for UI
export interface Station {
  id: string; // unique id for list keys
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  isFastCharging: boolean;
  rating: number;
  reviews: number;
  isOpen: boolean;
  connectors: Connector[];
  amenities: string[]; // e.g., "Wifi", "Dining", "Restrooms"
  provider: string; // e.g., "ChargePoint", "Tesla"
}

// Structure based on Gemini API Grounding Metadata
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
        author: string;
      }[];
    };
  };
}

export interface ChargingStationResponse {
  stations: Station[];
  chunks: GroundingChunk[];
  summaryText: string;
}

export enum AppState {
  PERMISSION_REQUEST = 'PERMISSION_REQUEST',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
}

export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  DETAILS = 'DETAILS',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE',
}

export type ViewMode = 'list' | 'map';