'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import type {
  Amenity,
  HDZScore,
  Language,
  LocationData,
  MapLayerState,
  ProgramData,
  Scenario,
} from '@/types/hdz';
import { calculateHDZScore } from '@/lib/scoring/engine';
import { fetchNearbyAmenities, reverseGeocode } from '@/lib/overpass';

// ─── State ────────────────────────────────────────────────────────────────────
interface HDZState {
  language: Language;
  location: LocationData | null;
  program: ProgramData;
  amenities: Amenity[];
  score: HDZScore | null;
  isLoading: boolean;
  mapLayers: MapLayerState;
  scenarios: Scenario[];
  activeScenarioId: string | null;
}

const defaultProgram: ProgramData = {
  housingType: 'temporary_housing',
  residents: 40,
  duration: 'medium',
  management: 'daytime',
};

const defaultMapLayers: MapLayerState = {
  amenities: true,
  transport: true,
  residential: false,
  schools: true,
  greenSpace: false,
  socialRisk: false,
  radiusCircles: true,
};

const initialState: HDZState = {
  language: 'en',
  location: null,
  program: defaultProgram,
  amenities: [],
  score: null,
  isLoading: false,
  mapLayers: defaultMapLayers,
  scenarios: [],
  activeScenarioId: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_LOCATION'; payload: LocationData | null }
  | { type: 'SET_PROGRAM'; payload: Partial<ProgramData> }
  | { type: 'SET_AMENITIES'; payload: Amenity[] }
  | { type: 'SET_SCORE'; payload: HDZScore | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_MAP_LAYER'; payload: keyof MapLayerState }
  | { type: 'SET_MAP_LAYERS'; payload: MapLayerState }
  | { type: 'SAVE_SCENARIO'; payload: Scenario }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'SET_ACTIVE_SCENARIO'; payload: string | null }
  | { type: 'LOAD_SCENARIOS'; payload: Scenario[] };

function reducer(state: HDZState, action: Action): HDZState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_PROGRAM':
      return { ...state, program: { ...state.program, ...action.payload } };
    case 'SET_AMENITIES':
      return { ...state, amenities: action.payload };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_MAP_LAYER':
      return {
        ...state,
        mapLayers: { ...state.mapLayers, [action.payload]: !state.mapLayers[action.payload] },
      };
    case 'SET_MAP_LAYERS':
      return { ...state, mapLayers: action.payload };
    case 'SAVE_SCENARIO': {
      const exists = state.scenarios.findIndex((s) => s.id === action.payload.id);
      const updated =
        exists >= 0
          ? state.scenarios.map((s) => (s.id === action.payload.id ? action.payload : s))
          : [...state.scenarios, action.payload];
      return { ...state, scenarios: updated };
    }
    case 'DELETE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.payload),
        activeScenarioId:
          state.activeScenarioId === action.payload ? null : state.activeScenarioId,
      };
    case 'SET_ACTIVE_SCENARIO':
      return { ...state, activeScenarioId: action.payload };
    case 'LOAD_SCENARIOS':
      return { ...state, scenarios: action.payload };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface HDZContextValue {
  state: HDZState;
  setLanguage: (lang: Language) => void;
  setLocation: (loc: LocationData | null) => void;
  updateProgram: (updates: Partial<ProgramData>) => void;
  toggleMapLayer: (layer: keyof MapLayerState) => void;
  analyzeLocation: (loc: LocationData) => Promise<void>;
  saveScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (id: string) => void;
}

const HDZContext = createContext<HDZContextValue | null>(null);

const STORAGE_KEY = 'hdz-scenarios-v1';

export function HDZProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Scenario[] = JSON.parse(raw);
        dispatch({ type: 'LOAD_SCENARIOS', payload: saved });
      }
    } catch { /* ignore */ }
  }, []);

  // Persist scenarios to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.scenarios));
    } catch { /* ignore */ }
  }, [state.scenarios]);

  // Recalculate score when program changes (if we have amenities)
  useEffect(() => {
    if (state.amenities.length > 0 || state.location) {
      const score = calculateHDZScore(state.location, state.program, state.amenities);
      dispatch({ type: 'SET_SCORE', payload: score });
    }
  }, [state.program, state.amenities, state.location]);

  const setLanguage = useCallback((lang: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  }, []);

  const setLocation = useCallback((loc: LocationData | null) => {
    dispatch({ type: 'SET_LOCATION', payload: loc });
  }, []);

  const updateProgram = useCallback((updates: Partial<ProgramData>) => {
    dispatch({ type: 'SET_PROGRAM', payload: updates });
  }, []);

  const toggleMapLayer = useCallback((layer: keyof MapLayerState) => {
    dispatch({ type: 'TOGGLE_MAP_LAYER', payload: layer });
  }, []);

  const analyzeLocation = useCallback(async (loc: LocationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOCATION', payload: loc });
    try {
      // Enrich with reverse geocode if needed
      let enrichedLoc = loc;
      if (!loc.zoneType || loc.zoneType === 'unknown') {
        const reversed = await reverseGeocode(loc.coordinates);
        if (reversed) {
          const addr = reversed.address;
          enrichedLoc = {
            ...loc,
            neighborhood: addr?.neighbourhood ?? addr?.suburb ?? addr?.road,
            municipality: addr?.city ?? addr?.town ?? addr?.municipality,
            postcode: addr?.postcode,
            zoneType: inferZoneType(reversed),
          };
        }
      }
      dispatch({ type: 'SET_LOCATION', payload: enrichedLoc });

      const amenities = await fetchNearbyAmenities(loc.coordinates, 1000);
      dispatch({ type: 'SET_AMENITIES', payload: amenities });

      const score = calculateHDZScore(enrichedLoc, state.program, amenities);
      dispatch({ type: 'SET_SCORE', payload: score });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.program]);

  // Initial load: Default to Utrecht if nothing selected
  useEffect(() => {
    if (!state.location && !state.isLoading && state.amenities.length === 0) {
      // Small timeout to allow scenarios to load from localStorage first
      const t = setTimeout(() => {
        if (state.location || state.activeScenarioId) return;
        // Utrecht Kanaalstraat 45 coordinates as default
        analyzeLocation({
          address: 'Kanaalstraat 45, Utrecht',
          coordinates: { lat: 52.0934, lng: 5.1011 },
          zoneType: 'mixed'
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [state.location, state.isLoading, state.amenities.length, state.activeScenarioId, analyzeLocation]);

  const saveScenario = useCallback(
    (name: string) => {
      const scenario: Scenario = {
        id: `scenario-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        location: state.location,
        program: { ...state.program },
        score: state.score,
        amenities: state.amenities,
      };
      dispatch({ type: 'SAVE_SCENARIO', payload: scenario });
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: scenario.id });
    },
    [state.location, state.program, state.score, state.amenities]
  );

  const deleteScenario = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SCENARIO', payload: id });
  }, []);

  const loadScenario = useCallback(
    (id: string) => {
      const scenario = state.scenarios.find((s) => s.id === id);
      if (!scenario) return;
      dispatch({ type: 'SET_LOCATION', payload: scenario.location });
      dispatch({ type: 'SET_PROGRAM', payload: scenario.program });
      dispatch({ type: 'SET_AMENITIES', payload: scenario.amenities });
      dispatch({ type: 'SET_SCORE', payload: scenario.score });
      dispatch({ type: 'SET_ACTIVE_SCENARIO', payload: id });
    },
    [state.scenarios]
  );

  return (
    <HDZContext.Provider
      value={{
        state,
        setLanguage,
        setLocation,
        updateProgram,
        toggleMapLayer,
        analyzeLocation,
        saveScenario,
        deleteScenario,
        loadScenario,
      }}
    >
      {children}
    </HDZContext.Provider>
  );
}

export function useHDZ(): HDZContextValue {
  const ctx = useContext(HDZContext);
  if (!ctx) throw new Error('useHDZ must be used within HDZProvider');
  return ctx;
}

// Infer zone type from Nominatim result
function inferZoneType(result: { type?: string; class?: string; address?: { road?: string } }): import('@/types/hdz').ZoneType {
  const cls = result.class ?? '';
  const type = result.type ?? '';
  if (cls === 'landuse') {
    if (type === 'residential') return 'residential';
    if (type === 'commercial' || type === 'retail') return 'commercial';
    if (type === 'industrial') return 'industrial';
    if (type === 'farmland' || type === 'meadow') return 'rural';
    if (type === 'mixed') return 'mixed';
  }
  if (cls === 'building') {
    if (type === 'apartments' || type === 'house' || type === 'residential') return 'residential';
    if (type === 'commercial' || type === 'office') return 'commercial';
    if (type === 'industrial') return 'industrial';
  }
  if (cls === 'highway' || cls === 'amenity') return 'mixed';
  return 'unknown';
}
