'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Amenity, AmenityType, LatLng, MapLayerState } from '@/types/hdz';

let L: typeof import('leaflet') | null = null;

// ── Tiles: CartoDB Positron (light greyscale) ────────────────────────────────
const CARTO_POSITRON = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const RADIUS_COLORS: Record<number, string> = {
  300: '#3b82f6',
  500: '#8b5cf6',
  750: '#a855f7',
  1000: '#6366f1',
  1500: '#4f46e5',
};

// ── Amenity appearance ────────────────────────────────────────────────────────
// Extended to cover specific Dutch social care facilities
const AMENITY_COLOR: Record<AmenityType, string> = {
  food:       '#10b981',   // green
  healthcare: '#ef4444',   // red
  sanitation: '#06b6d4',   // cyan
  transport:  '#f59e0b',   // amber
  school:     '#8b5cf6',   // purple
  green:      '#22c55e',   // lime
  social:     '#f97316',   // orange
  housing:    '#6b7280',   // grey
};

// Richer icon set – uses name/tags from Overpass to pick specific icon
function getIconForAmenity(amenity: Amenity): { icon: string; color: string } {
  const name = (amenity.name ?? '').toLowerCase();
  const color = AMENITY_COLOR[amenity.type];

  if (amenity.type === 'sanitation') {
    if (name.includes('toilet') || name.includes('wc')) return { icon: '🚽', color: '#06b6d4' };
    if (name.includes('douche') || name.includes('shower') || name.includes('bad')) return { icon: '🚿', color: '#0ea5e9' };
    return { icon: '🚿', color };
  }
  if (amenity.type === 'food') {
    if (name.includes('voedselbank') || name.includes('food bank')) return { icon: '🍲', color: '#059669' };
    if (name.includes('soep') || name.includes('soup')) return { icon: '🍜', color: '#059669' };
    return { icon: '🛒', color };
  }
  if (amenity.type === 'social') {
    if (name.includes('nacht') || name.includes('night') || name.includes('overnight')) return { icon: '🌙', color: '#7c3aed' };
    if (name.includes('dag') || name.includes('day centre') || name.includes('inloop')) return { icon: '☀️', color: '#d97706' };
    if (name.includes('dakloos') || name.includes('homeless') || name.includes('opvang') || name.includes('shelter')) return { icon: '🏠', color: '#dc2626' };
    if (name.includes('voedsel') || name.includes('food')) return { icon: '🍲', color: '#059669' };
    return { icon: '🤝', color };
  }
  if (amenity.type === 'healthcare') {
    if (name.includes('apotheek') || name.includes('pharma')) return { icon: '💊', color: '#f43f5e' };
    if (name.includes('ziekenhuis') || name.includes('hospital')) return { icon: '🏥', color: '#ef4444' };
    if (name.includes('ggz') || name.includes('mental')) return { icon: '🧠', color: '#a855f7' };
    return { icon: '➕', color };
  }
  const ICONS: Record<AmenityType, string> = {
    food: '🛒', healthcare: '➕', sanitation: '🚿',
    transport: '🚌', school: '🏫', green: '🌳', social: '🤝', housing: '🏠',
  };
  return { icon: ICONS[amenity.type], color };
}

interface LeafletMapProps {
  center: LatLng;
  amenities: Amenity[];
  mapLayers: MapLayerState;
  onMapClick: (latlng: LatLng) => void;
  language: 'en' | 'nl';
  activeRadius?: number;
}

export default function LeafletMap({
  center, amenities, mapLayers, onMapClick, language, activeRadius = 1000,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Layer[]>([]);
  const radiiRef = useRef<import('leaflet').Circle[]>([]);
  const pinRef = useRef<import('leaflet').Marker | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      L = leaflet.default ?? leaflet;
      setLeafletLoaded(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || !L) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer(CARTO_POSITRON, {
      attribution: CARTO_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    // CRITICAL: force Leaflet to recalculate container size after React layout
    setTimeout(() => map.invalidateSize(), 50);
    setTimeout(() => map.invalidateSize(), 300);

    // Also re-measure on container resize (flex layout changes)
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    ro.observe(containerRef.current!);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded]);

  // Fly to center + pin
  useEffect(() => {
    if (!mapRef.current || !L) return;
    mapRef.current.flyTo([center.lat, center.lng], 15, { duration: 1.2 });
    if (pinRef.current) pinRef.current.remove();
    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;background:#3b82f6;
        border:3px solid #fff;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 4px 16px rgba(59,130,246,0.6);
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
    pinRef.current = L.marker([center.lat, center.lng], { icon: pinIcon })
      .addTo(mapRef.current)
      .bindPopup(language === 'nl' ? '<b>Geselecteerde locatie</b>' : '<b>Selected location</b>');
  }, [center, language]);

  // Radius circles
  useEffect(() => {
    if (!mapRef.current || !L) return;
    radiiRef.current.forEach((c) => c.remove());
    radiiRef.current = [];
    if (!mapLayers.radiusCircles) return;

    [1000, 500, 300].forEach((r) => {
      const isActive = r === activeRadius;
      const col = RADIUS_COLORS[r] ?? '#3b82f6';
      const circle = L!.circle([center.lat, center.lng], {
        radius: r,
        color: col,
        fillColor: col,
        fillOpacity: isActive ? 0.06 : 0.01,
        weight: isActive ? 3 : 1.5,
        dashArray: isActive ? undefined : '8 5',
        opacity: isActive ? 0.9 : 0.35,
      }).addTo(mapRef.current!);
      L!.marker([center.lat + r / 111320, center.lng], {
        icon: L!.divIcon({
          className: '',
          html: `<span style="
            background:rgba(10,14,26,0.85);
            color:${col};
            font-size:${isActive ? 11 : 9}px;
            font-weight:${isActive ? 800 : 600};
            padding:1px 5px;border-radius:4px;
            border:1px solid ${col}60;
            white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,0.5);
          ">${r}m</span>`,
        }),
      }).addTo(mapRef.current!);
      radiiRef.current.push(circle);
    });
  }, [center, mapLayers.radiusCircles, activeRadius]);

  // Amenity markers — larger, high-contrast, with white background ring
  useEffect(() => {
    if (!mapRef.current || !L) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visibleTypes = new Set<AmenityType>();
    if (mapLayers.amenities) {
      visibleTypes.add('food');
      visibleTypes.add('sanitation');
      visibleTypes.add('social');
      visibleTypes.add('healthcare');
    }
    if (mapLayers.transport) visibleTypes.add('transport');
    if (mapLayers.schools) visibleTypes.add('school');
    if (mapLayers.greenSpace) visibleTypes.add('green');
    if (mapLayers.residential) visibleTypes.add('housing');

    amenities
      .filter((a) => visibleTypes.has(a.type))
      .slice(0, 100)
      .forEach((amenity) => {
        const { icon, color } = getIconForAmenity(amenity);
        const dist = Math.round(amenity.distanceMeters);
        const distLabel = dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${amenity.coordinates.lat},${amenity.coordinates.lng}`;
        const marker = L!.marker([amenity.coordinates.lat, amenity.coordinates.lng], {
          icon: L!.divIcon({
            className: '',
            // Large, high-contrast marker: white outer ring + colored fill + large emoji
            html: `<div style="
              position:relative;
              width:36px;height:36px;
              background:white;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 2px 8px rgba(0,0,0,0.55),0 0 0 2px ${color};
              font-size:17px;
              line-height:1;
            ">${icon}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width:160px; font-family: sans-serif;">
              <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:13px; display:block; margin-bottom:2px; color:#60a5fa; font-weight:bold; text-decoration:none; display:flex; align-items:center; gap:4px;">
                ${amenity.name} <span style="font-size:10px;">↗</span>
              </a>
              ${amenity.amenityTypeLabel ? `
                <span style="font-size:10px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                  ${language === 'nl' ? amenity.amenityTypeLabel.nl : amenity.amenityTypeLabel.en}
                </span>
              ` : ''}
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">
                <span style="color:#94a3b8;font-size:10px; font-weight:500;">
                  📍 ${distLabel} ${language === 'nl' ? 'van locatie' : 'from site'}
                </span>
                ${amenity.website ? `
                  <a href="${amenity.website}" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:#3b82f6; text-decoration:none; font-weight:600; display:flex; align-items:center; gap:2px;">
                    Website ↗
                  </a>
                ` : ''}
              </div>
            </div>
          `);
        markersRef.current.push(marker);
      });
  }, [amenities, mapLayers, language]);

  // Legend items
  const legendItems: { type: AmenityType; icon: string; labelNl: string; labelEn: string }[] = [
    { type: 'food',       icon: '🛒', labelNl: 'Voedsel / Voedselbank', labelEn: 'Food / Food bank' },
    { type: 'sanitation', icon: '🚽', labelNl: 'Toilet / Douche',       labelEn: 'Toilet / Shower' },
    { type: 'healthcare', icon: '➕', labelNl: 'Zorg / Apotheek',        labelEn: 'Care / Pharmacy' },
    { type: 'social',     icon: '🤝', labelNl: 'Opvang / Dagcentrum',   labelEn: 'Shelter / Day centre' },
    { type: 'transport',  icon: '🚌', labelNl: 'Openbaar vervoer',       labelEn: 'Public transport' },
  ];

  return (
    <div className="relative w-full h-full" style={{ minHeight: 200 }}>
      {/* hdz-map class applies the greyscale brightness filter via globals.css */}
      <div ref={containerRef} className="hdz-map w-full h-full" style={{ minHeight: 200 }} />

      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]">
          <div className="text-[#3b82f6] text-sm animate-pulse">
            {language === 'nl' ? 'Kaart laden...' : 'Loading map...'}
          </div>
        </div>
      )}

      {/* Legend — bottom left, always visible */}
      <div className="absolute bottom-3 left-3 z-[500] bg-[#0d1117]/92 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 space-y-1.5 shadow-xl">
        {/* Radius legend */}
        {mapLayers.radiusCircles && (
          <>
            {[300, 500, 1000].map((r) => (
              <div key={r} className="flex items-center gap-2">
                <div className="w-4 h-px" style={{ background: RADIUS_COLORS[r] ?? '#3b82f6', height: r === activeRadius ? 2 : 1 }} />
                <span className="text-[9px]" style={{ color: RADIUS_COLORS[r] ?? '#3b82f6', fontWeight: r === activeRadius ? 700 : 400 }}>{r}m</span>
              </div>
            ))}
            <div className="h-px bg-white/10 my-1" />
          </>
        )}

        {/* Amenity type legend */}
        {legendItems.filter((li) => {
          const vis = new Set<AmenityType>();
          if (mapLayers.amenities) { vis.add('food'); vis.add('sanitation'); vis.add('social'); vis.add('healthcare'); }
          if (mapLayers.transport) vis.add('transport');
          return vis.has(li.type);
        }).map((li) => (
          <div key={li.type} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm"
              style={{ boxShadow: `0 0 0 1.5px ${AMENITY_COLOR[li.type]}` }}>
              {li.icon}
            </div>
            <span className="text-[9px] text-[#94a3b8]">
              {language === 'nl' ? li.labelNl : li.labelEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
