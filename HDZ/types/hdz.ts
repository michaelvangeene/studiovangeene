// ─── Location ─────────────────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates: LatLng;
  neighborhood?: string;
  municipality?: string;
  postcode?: string;
  zoneType?: ZoneType;
}

export type ZoneType =
  | 'residential'
  | 'mixed'
  | 'commercial'
  | 'industrial'
  | 'rural'
  | 'unknown';

// ─── Program ──────────────────────────────────────────────────────────────────
export type HousingType =
  | 'temporary_housing'
  | 'asylum_center'
  | 'homeless_shelter'
  | 'migrant_housing'
  | 'mixed_housing';

export type ManagementType = 'none' | 'daytime' | '24_7' | 'care_based';

export type DurationType = 'short' | 'medium' | 'permanent';

export interface ProgramData {
  housingType: HousingType;
  residents: number;
  duration: DurationType;
  management: ManagementType;
}

// ─── Nearby Amenities (from OSM) ──────────────────────────────────────────────
export interface Amenity {
  id: string;
  type: AmenityType;
  name: string;
  amenityTypeLabel?: { en: string; nl: string };
  website?: string;
  coordinates: LatLng;
  distanceMeters: number;
}

export type AmenityType =
  | 'food'
  | 'healthcare'
  | 'sanitation'
  | 'transport'
  | 'school'
  | 'green'
  | 'social'
  | 'housing';

// ─── Scoring ──────────────────────────────────────────────────────────────────
export interface SubScore {
  key: string;
  labelEn: string;
  labelNl: string;
  score: number;
  max: number;
  notes?: string;
}

export interface LayerScore {
  key: LayerKey;
  labelEn: string;
  labelNl: string;
  score: number;
  max: number;
  subScores: SubScore[];
}

export type LayerKey =
  | 'basicNeeds'
  | 'spatialFit'
  | 'impact'
  | 'governance'
  | 'policyFit';

export type HDZCategory = 'strong' | 'moderate' | 'weak' | 'critical';

export interface HDZScore {
  total: number; // 0–100
  category: HDZCategory;
  layers: Record<LayerKey, LayerScore>;
  legallyDefensible: boolean;
  redFlags: RedFlag[];
  recommendations: Recommendation[];
}

// ─── Red Flags & Recommendations ──────────────────────────────────────────────
export interface RedFlag {
  id: string;
  severity: 'error' | 'warning';
  messageEn: string;
  messageNl: string;
  layer: LayerKey;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  messageEn: string;
  messageNl: string;
  layer: LayerKey;
}

// ─── Map Layers ────────────────────────────────────────────────────────────────
export interface MapLayerState {
  amenities: boolean;
  transport: boolean;
  residential: boolean;
  schools: boolean;
  greenSpace: boolean;
  socialRisk: boolean;
  radiusCircles: boolean;
}

// ─── Scenario ─────────────────────────────────────────────────────────────────
export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  location: LocationData | null;
  program: ProgramData;
  score: HDZScore | null;
  amenities: Amenity[];
}

// ─── Language ─────────────────────────────────────────────────────────────────
export type Language = 'en' | 'nl';
