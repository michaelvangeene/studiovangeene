'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useHDZ } from '@/context/HDZContext';
import { geocodeAddress } from '@/lib/overpass';
import type { NominatimResult } from '@/lib/overpass';

const t = {
  en: {
    searchPlaceholder: 'Search address in the Netherlands…',
    searching: 'Searching…',
    noResults: 'No results found',
    clickMap: 'or click on the map',
    location: 'Location',
    neighborhood: 'Neighborhood',
    municipality: 'Municipality',
    zone: 'Zone type',
    postcode: 'Postcode',
  },
  nl: {
    searchPlaceholder: 'Zoek adres in Nederland…',
    searching: 'Zoeken…',
    noResults: 'Geen resultaten gevonden',
    clickMap: 'of klik op de kaart',
    location: 'Locatie',
    neighborhood: 'Buurt',
    municipality: 'Gemeente',
    zone: 'Bestemmingstype',
    postcode: 'Postcode',
  },
};

export default function LocationSearch() {
  const { state, analyzeLocation } = useHDZ();
  const lang = state.language;
  const tx = t[lang];

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length < 3) { setResults([]); setOpen(false); return; }
      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        const res = await geocodeAddress(value);
        setResults(res);
        setOpen(res.length > 0);
        setSearching(false);
      }, 350);
    },
    []
  );

  const handleSelect = useCallback(
    async (result: NominatimResult) => {
      setQuery(result.display_name.split(',').slice(0, 2).join(',').trim());
      setOpen(false);
      setResults([]);
      const addr = result.address;
      await analyzeLocation({
        address: result.display_name,
        coordinates: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
        neighborhood: addr?.neighbourhood ?? addr?.suburb ?? addr?.road,
        municipality: addr?.city ?? addr?.town ?? addr?.municipality,
        postcode: addr?.postcode,
        zoneType: 'unknown',
      });
    },
    [analyzeLocation]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.location-search-wrapper')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loc = state.location;

  return (
    <div className="space-y-3">
      <div className="location-search-wrapper relative">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id="location-search-input"
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={tx.searchPlaceholder}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 transition-colors"
            autoComplete="off"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
            </span>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50 overflow-hidden max-h-52 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.place_id}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-[#334155] transition-colors border-b border-[#334155]/50 last:border-0"
              >
                <div className="text-xs text-white font-medium truncate">
                  {r.display_name.split(',').slice(0, 2).join(',')}
                </div>
                <div className="text-[10px] text-[#64748b] truncate mt-0.5">
                  {r.display_name.split(',').slice(2).join(',').trim()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#475569] text-center">{tx.clickMap}</p>

      {loc && (
        <div className="bg-[#1e293b]/60 rounded-lg p-3 space-y-1.5 border border-[#334155]/50">
          {loc.neighborhood && (
            <InfoRow label={tx.neighborhood} value={loc.neighborhood} />
          )}
          {loc.municipality && (
            <InfoRow label={tx.municipality} value={loc.municipality} />
          )}
          {loc.postcode && <InfoRow label={tx.postcode} value={loc.postcode} />}
          {loc.zoneType && loc.zoneType !== 'unknown' && (
            <InfoRow label={tx.zone} value={capitalise(loc.zoneType)} />
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-[#64748b]">{label}</span>
      <span className="text-[10px] text-[#94a3b8] font-medium">{value}</span>
    </div>
  );
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}
