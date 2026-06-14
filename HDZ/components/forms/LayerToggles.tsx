'use client';

import { useHDZ } from '@/context/HDZContext';
import type { MapLayerState } from '@/types/hdz';

const LAYERS: {
  key: keyof MapLayerState;
  iconEn: string;
  labelEn: string;
  labelNl: string;
  color: string;
}[] = [
  { key: 'amenities', iconEn: '🛒', labelEn: 'Amenities', labelNl: 'Voorzieningen', color: '#10b981' },
  { key: 'transport', iconEn: '🚌', labelEn: 'Public Transport', labelNl: 'Openbaar Vervoer', color: '#f59e0b' },
  { key: 'residential', iconEn: '🏠', labelEn: 'Residential Areas', labelNl: 'Woongebieden', color: '#6b7280' },
  { key: 'schools', iconEn: '🏫', labelEn: 'Schools', labelNl: 'Scholen', color: '#8b5cf6' },
  { key: 'greenSpace', iconEn: '🌳', labelEn: 'Green Space', labelNl: 'Groengebied', color: '#22c55e' },
  { key: 'socialRisk', iconEn: '⚠️', labelEn: 'Social Risk Zones', labelNl: 'Sociale Risicogebieden', color: '#ef4444' },
  { key: 'radiusCircles', iconEn: '◎', labelEn: 'Radius Circles', labelNl: 'Radiuscirkels', color: '#3b82f6' },
];

const t = {
  en: { title: 'Map Layers' },
  nl: { title: 'Kaartlagen' },
};

export default function LayerToggles() {
  const { state, toggleMapLayer } = useHDZ();
  const lang = state.language;

  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#64748b] mb-2.5">
        {t[lang].title}
      </h4>
      <div className="space-y-1">
        {LAYERS.map(({ key, iconEn, labelEn, labelNl, color }) => {
          const active = state.mapLayers[key];
          return (
            <button
              key={key}
              id={`layer-toggle-${key}`}
              onClick={() => toggleMapLayer(key)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-all ${
                active
                  ? 'bg-white/5 border border-white/10'
                  : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${active ? 'opacity-100' : 'opacity-30'}`}
                style={{ background: color, boxShadow: active ? `0 0 6px ${color}` : 'none' }}
              />
              <span className="text-sm">{iconEn}</span>
              <span className={`text-xs transition-colors ${active ? 'text-white' : 'text-[#475569]'}`}>
                {lang === 'nl' ? labelNl : labelEn}
              </span>
              <div
                className={`ml-auto w-6 h-3 rounded-full transition-all flex items-center px-0.5 ${
                  active ? 'bg-[#3b82f6]' : 'bg-[#334155]'
                }`}
              >
                <div
                  className={`w-2 h-2 bg-white rounded-full transition-transform ${active ? 'translate-x-3' : 'translate-x-0'}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
