'use client';

import { useState } from 'react';
import { useHDZ } from '@/context/HDZContext';
import LocationSearch from '@/components/forms/LocationSearch';
import ProgramForm from '@/components/forms/ProgramForm';
import LayerToggles from '@/components/forms/LayerToggles';
import type { AmenityType } from '@/types/hdz';

const AMENITY_ICON: Record<AmenityType, string> = {
  food: '🛒', healthcare: '🏥', sanitation: '🚿',
  transport: '🚌', school: '🏫', green: '🌳', social: '🤝', housing: '🏠',
};
const AMENITY_LABEL_NL: Record<AmenityType, string> = {
  food: 'Supermarkt', healthcare: 'Huisarts', sanitation: 'Sanitair',
  transport: 'OV-halte', school: 'School', green: 'Park / groen', social: 'Wijkcentrum', housing: 'Woning',
};
const AMENITY_LABEL_EN: Record<AmenityType, string> = {
  food: 'Food', healthcare: 'Healthcare', sanitation: 'Sanitation',
  transport: 'Transit', school: 'School', green: 'Green space', social: 'Social', housing: 'Housing',
};

const t = {
  en: { title: 'Location & Programme', update: 'Update Analysis', overview: 'Location Overview', layers: 'Map Layers', about: 'About HDZ Score', aboutText: 'The HDZ score assesses a location and programme across five layers to determine whether it is legally, spatially, and socially defensible.', noAmenities: 'Analyse a location to see nearby facilities.' },
  nl: { title: 'Locatie & Programma', update: 'Update Analyse', overview: 'Locatie Overzicht', layers: 'Lagen (Kaart)', about: 'Over HDZ Score', aboutText: 'De HDZ-score beoordeelt de locatie en het programma op vijf lagen die samen bepalen of een voorziening juridisch, ruimtelijk en maatschappelijk verdedigbaar is.', noAmenities: 'Analyseer een locatie om nabijgelegen voorzieningen te zien.' },
};

export default function LeftPanel() {
  const { state, analyzeLocation } = useHDZ();
  const lang = state.language;
  const tx = t[lang];
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!state.location) return;
    setIsUpdating(true);
    await analyzeLocation(state.location);
    setIsUpdating(false);
  };

  // Get nearest amenity per type
  const nearestByType = new Map<AmenityType, number>();
  state.amenities.forEach((a) => {
    const existing = nearestByType.get(a.type);
    if (existing === undefined || a.distanceMeters < existing) {
      nearestByType.set(a.type, a.distanceMeters);
    }
  });

  const overviewTypes: AmenityType[] = ['food', 'sanitation', 'healthcare', 'transport', 'green'];

  return (
    <aside className="flex flex-col h-full bg-[#0d1117] border-r border-[#1e293b] overflow-y-auto text-sm">

      {/* Section 1: Location & Programme */}
      <div className="p-3 border-b border-[#1e293b]">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-3">
          1. {tx.title}
        </h3>
        <div className="space-y-3">
          <LocationSearch />
          <ProgramForm />
        </div>
        <button
          id="update-analyse-btn"
          onClick={handleUpdate}
          disabled={!state.location || isUpdating}
          className={`mt-3 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            !state.location || isUpdating
              ? 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
              : 'bg-[#6d28d9] hover:bg-[#7c3aed] text-white shadow-lg shadow-purple-900/30'
          }`}
        >
          {isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              {lang === 'nl' ? 'Bezig…' : 'Updating…'}
            </span>
          ) : tx.update}
        </button>
      </div>

      {/* Section 2: Location overview */}
      <div className="p-3 border-b border-[#1e293b]">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-2">{tx.overview}</h3>
        {nearestByType.size === 0 ? (
          <p className="text-[10px] text-[#475569] italic">{tx.noAmenities}</p>
        ) : (
          <div className="space-y-1.5">
            {overviewTypes.map((type) => {
              const dist = nearestByType.get(type);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{AMENITY_ICON[type]}</span>
                    <span className="text-[10px] text-[#94a3b8]">
                      {lang === 'nl' ? AMENITY_LABEL_NL[type] : AMENITY_LABEL_EN[type]}
                    </span>
                  </div>
                  {dist !== undefined ? (
                    <span className={`text-[10px] font-semibold ${dist <= 300 ? 'text-[#10b981]' : dist <= 600 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                      {dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#475569]">{lang === 'nl' ? 'niet gevonden' : 'not found'}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Map layers */}
      <div className="p-3 border-b border-[#1e293b]">
        <LayerToggles />
      </div>

      {/* Section 4: About */}
      <div className="p-3">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-1.5">{tx.about}</h3>
        <p className="text-[9px] text-[#475569] leading-relaxed">{tx.aboutText}</p>
      </div>
    </aside>
  );
}
