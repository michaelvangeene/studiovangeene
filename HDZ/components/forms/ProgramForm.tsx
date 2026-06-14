'use client';

import { useHDZ } from '@/context/HDZContext';
import type { HousingType, ManagementType } from '@/types/hdz';

const HOUSING_TYPES_NL: Record<HousingType, string> = {
  temporary_housing: 'Tijdelijke woonvoorziening',
  asylum_center: 'Asielzoekerscentrum',
  homeless_shelter: 'Daklozenopvang',
  migrant_housing: 'Arbeidsmigranten',
  mixed_housing: 'Gemengde huisvesting',
};
const HOUSING_TYPES_EN: Record<HousingType, string> = {
  temporary_housing: 'Temporary Housing',
  asylum_center: 'Asylum Center',
  homeless_shelter: 'Homeless Shelter',
  migrant_housing: 'Migrant Housing',
  mixed_housing: 'Mixed Housing',
};
const MGMT_NL: Record<ManagementType, string> = {
  none: 'Geen beheer', daytime: 'Dagelijks beheer', '24_7': '24/7 begeleiding aanwezig', care_based: 'Zorgbegeleiding',
};
const MGMT_EN: Record<ManagementType, string> = {
  none: 'No management', daytime: 'Daytime management', '24_7': '24/7 supervision', care_based: 'Care-based',
};

export default function ProgramForm() {
  const { state, updateProgram } = useHDZ();
  const lang = state.language;
  const nl = lang === 'nl';
  const prog = state.program;

  return (
    <div className="space-y-2.5">
      {/* Programme type */}
      <div>
        <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#64748b] mb-1">
          {nl ? 'Programma' : 'Programme'}
        </label>
        <select
          id="housing-type-select"
          value={prog.housingType}
          onChange={(e) => updateProgram({ housingType: e.target.value as HousingType })}
          className="w-full bg-[#111827] border border-[#334155] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
        >
          {(Object.keys(HOUSING_TYPES_NL) as HousingType[]).map((k) => (
            <option key={k} value={k}>{nl ? HOUSING_TYPES_NL[k] : HOUSING_TYPES_EN[k]}</option>
          ))}
        </select>
      </div>

      {/* Residents */}
      <div>
        <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#64748b] mb-1">
          {nl ? 'Aantal bewoners' : 'Residents'}
        </label>
        <div className="flex items-center gap-2 bg-[#111827] border border-[#334155] rounded-md px-2 py-1.5">
          <span className="text-xs text-[#64748b]">👥</span>
          <input
            id="residents-input"
            type="number"
            min={1}
            max={500}
            value={prog.residents}
            onChange={(e) => updateProgram({ residents: Math.max(1, parseInt(e.target.value) || 1) })}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none w-12"
          />
          <span className="text-[9px] text-[#475569]">{nl ? 'personen' : 'persons'}</span>
        </div>
      </div>

      {/* Management */}
      <div>
        <label className="block text-[9px] font-semibold uppercase tracking-widest text-[#64748b] mb-1">
          {nl ? 'Beheertype' : 'Management'}
        </label>
        <select
          id="management-select"
          value={prog.management}
          onChange={(e) => updateProgram({ management: e.target.value as ManagementType })}
          className="w-full bg-[#111827] border border-[#334155] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
        >
          {(Object.keys(MGMT_NL) as ManagementType[]).map((k) => (
            <option key={k} value={k}>{nl ? MGMT_NL[k] : MGMT_EN[k]}</option>
          ))}
        </select>
        {prog.management === 'none' && (
          <p className="text-[8px] text-[#ef4444] mt-0.5">⚠ {nl ? 'Geen beheer verlaagt juridische verdedigbaarheid' : 'No management reduces legal defensibility'}</p>
        )}
      </div>
    </div>
  );
}
