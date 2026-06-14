'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import type { LatLng } from '@/types/hdz';
import { useHDZ } from '@/context/HDZContext';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0e1a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#3b82f6] text-xs">Kaart laden…</span>
      </div>
    </div>
  ),
});

const DEFAULT_CENTER: LatLng = { lat: 52.3676, lng: 4.9041 };

const RADIUS_OPTIONS = [300, 500, 750, 1000, 1500];

const t = {
  en: { walkingDist: 'Walking distance', hint: '📍 Click the map or search an address to analyse a location', analysing: 'Analysing location…' },
  nl: { walkingDist: 'Loopafstand', hint: '📍 Klik op de kaart of zoek een adres om een locatie te analyseren', analysing: 'Locatie analyseren…' },
};

export default function MapPanel() {
  const { state, analyzeLocation, toggleMapLayer } = useHDZ();
  const lang = state.language;
  const tx = t[lang];
  const [activeRadius, setActiveRadius] = useState(1000);

  const handleMapClick = useCallback(
    async (latlng: LatLng) => {
      await analyzeLocation({ address: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`, coordinates: latlng, zoneType: 'unknown' });
    },
    [analyzeLocation]
  );

  const center = state.location?.coordinates ?? DEFAULT_CENTER;

  return (
    <div className="relative w-full h-full bg-[#0a0e1a] flex flex-col">
      {/* Map toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#0d1117]/90 border-b border-[#1e293b] backdrop-blur-sm z-10">
        {/* Walking distance dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#64748b]">{tx.walkingDist}</span>
          <select
            id="walking-distance-select"
            value={activeRadius}
            onChange={(e) => setActiveRadius(Number(e.target.value))}
            className="bg-[#111827] border border-[#334155] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3b82f6] cursor-pointer"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} m</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-[#1e293b]" />

        {/* Quick layer toggles */}
        {[
          { key: 'amenities' as const, labelNl: 'Voorzieningen', labelEn: 'Amenities', color: '#10b981' },
          { key: 'transport' as const, labelNl: 'OV', labelEn: 'Transit', color: '#f59e0b' },
          { key: 'schools' as const, labelNl: 'Scholen', labelEn: 'Schools', color: '#8b5cf6' },
          { key: 'radiusCircles' as const, labelNl: 'Radii', labelEn: 'Radii', color: '#3b82f6' },
        ].map(({ key, labelNl, labelEn, color }) => {
          const active = state.mapLayers[key];
          return (
            <button
              key={key}
              onClick={() => toggleMapLayer(key)}
              className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-all ${active ? 'text-white border-opacity-60' : 'text-[#475569] border-[#1e293b] hover:border-[#334155]'}`}
              style={{ borderColor: active ? color + '60' : undefined, background: active ? color + '18' : undefined, color: active ? color : undefined }}
            >
              {lang === 'nl' ? labelNl : labelEn}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1">
          {state.location && (
            <span className="text-[9px] text-[#475569] truncate max-w-40">
              📍 {state.location.address.split(',').slice(0, 2).join(',')}
            </span>
          )}
        </div>
      </div>

      {/* Map — min-h ensures Leaflet gets a non-zero container size */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 200 }}>
        <LeafletMap
          center={center}
          amenities={state.amenities}
          mapLayers={state.mapLayers}
          onMapClick={handleMapClick}
          language={lang}
          activeRadius={activeRadius}
        />

        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]/60 backdrop-blur-sm z-[1000]">
            <div className="flex flex-col items-center gap-3 bg-[#111827] rounded-xl px-6 py-4 border border-[#3b82f6]/30">
              <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-xs font-medium">{tx.analysing}</span>
            </div>
          </div>
        )}

        {!state.location && !state.isLoading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
            <div className="bg-[#111827]/90 backdrop-blur-sm rounded-full px-4 py-2 text-[10px] text-[#94a3b8] border border-white/10">
              {tx.hint}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
