import type { Amenity, AmenityType, LatLng } from '@/types/hdz';

// Nominatim geocoding & reverse geocoding
export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    municipality?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
  };
  type?: string;
  class?: string;
}

export async function geocodeAddress(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=nl&limit=5&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'nl,en', 'User-Agent': 'HDZ-Dashboard/1.0' },
    });
    if (!res.ok) return [];
    return (await res.json()) as NominatimResult[];
  } catch {
    return [];
  }
}

export async function reverseGeocode(latlng: LatLng): Promise<NominatimResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'nl,en', 'User-Agent': 'HDZ-Dashboard/1.0' },
    });
    if (!res.ok) return null;
    return (await res.json()) as NominatimResult;
  } catch {
    return null;
  }
}

// Overpass API for nearby amenities
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Comprehensive Overpass queries — Dutch social care focus
const AMENITY_QUERIES: Record<AmenityType, string> = {
  // Voedsel: supermarkten, voedselbanken, inloopeters, eetcafés
  food: [
    `node["shop"~"supermarket|convenience|greengrocer|bakery"](around:{radius},{lat},{lng});`,
    `node["amenity"~"food_bank|soup_kitchen"](around:{radius},{lat},{lng});`,
    `node["social_facility"~"food_bank|soup_kitchen"](around:{radius},{lat},{lng});`,
    `node["amenity"="social_facility"]["social_facility"="food_bank"](around:{radius},{lat},{lng});`,
  ].join(''),

  // Zorg: huisarts, ziekenhuis, GGZ, apotheek, tandarts
  healthcare: [
    `node["amenity"~"hospital|clinic|doctors|pharmacy|dentist"](around:{radius},{lat},{lng});`,
    `node["healthcare"~"doctor|hospital|clinic|pharmacy|psychiatry"](around:{radius},{lat},{lng});`,
  ].join(''),

  // Sanitair: openbare toiletten, douches, badhuizen, wasserijen
  sanitation: [
    `node["amenity"~"toilets|shower|public_bath"](around:{radius},{lat},{lng});`,
    `node["amenity"="toilets"](around:{radius},{lat},{lng});`,
    `node["amenity"="shower"](around:{radius},{lat},{lng});`,
    `node["amenity"="laundry"](around:{radius},{lat},{lng});`,
    `node["shop"="laundry"](around:{radius},{lat},{lng});`,
  ].join(''),

  // OV: bus, tram, trein, metro
  transport: [
    `node["highway"="bus_stop"](around:{radius},{lat},{lng});`,
    `node["railway"~"station|halt|tram_stop"](around:{radius},{lat},{lng});`,
    `node["public_transport"~"stop_position|platform"](around:{radius},{lat},{lng});`,
  ].join(''),

  // Scholen
  school: `node["amenity"~"school|kindergarten|childcare|college"](around:{radius},{lat},{lng});`,

  // Groen
  green: [
    `way["leisure"~"park|garden|nature_reserve|recreation_ground"](around:{radius},{lat},{lng});`,
    `node["leisure"~"park|garden"](around:{radius},{lat},{lng});`,
  ].join(''),

  // Sociale opvang: dag/nacht opvang, daklozen, inloophuis, voedselbank, GGZ-klinieken, buurtcentra
  social: [
    `node["amenity"="social_facility"](around:{radius},{lat},{lng});`,
    `node["social_facility"~"shelter|homeless_shelter|food_bank|day_centre|night_shelter|housing"](around:{radius},{lat},{lng});`,
    `node["amenity"~"shelter|community_centre|social_centre|refugee"](around:{radius},{lat},{lng});`,
    `node["amenity"="community_centre"](around:{radius},{lat},{lng});`,
    `node["name"~"opvang|voedsel|dakloos|inloop|nacht|dag.*centrum|buurt|wijkcentrum|dak.*loos"]["amenity"](around:{radius},{lat},{lng});`,
  ].join(''),

  // Woningen (voor impact scoring)
  housing: `way["building"~"residential|apartments|house|terrace"](around:{radius},{lat},{lng});`,
};

function buildOverpassQuery(lat: number, lng: number, radius: number): string {
  const parts = Object.entries(AMENITY_QUERIES)
    .map(([, q]) =>
      q
        .replace(/{radius}/g, String(radius))
        .replace(/{lat}/g, String(lat))
        .replace(/{lng}/g, String(lng))
    )
    .join('\n');
  return `[out:json][timeout:25];\n(\n${parts}\n);\nout center;`;
}

function getTypeFromTags(tags: Record<string, string>): { type: AmenityType; labelEn: string; labelNl: string } {
  const amenity = tags.amenity ?? '';
  const shop = tags.shop ?? '';
  const leisure = tags.leisure ?? '';
  const highway = tags.highway ?? '';
  const railway = tags.railway ?? '';
  const building = tags.building ?? '';
  const socialFacility = tags['social_facility'] ?? '';
  const healthcare = tags['healthcare'] ?? '';
  const publicTransport = tags['public_transport'] ?? '';
  const name = (tags.name ?? '').toLowerCase();

  // Sanitation — toiletten, douches, wasserijen
  if (amenity === 'toilets') return { type: 'sanitation', labelEn: 'Public Toilet', labelNl: 'Openbaar Toilet' };
  if (amenity === 'shower' || amenity === 'public_bath') return { type: 'sanitation', labelEn: 'Public Shower/Bath', labelNl: 'Openbare Douche/Badhuis' };
  if (amenity === 'laundry' || shop === 'laundry') return { type: 'sanitation', labelEn: 'Laundromat', labelNl: 'Wasserette' };

  // Transport
  if (highway === 'bus_stop') return { type: 'transport', labelEn: 'Bus Stop', labelNl: 'Bushalte' };
  if (railway.match(/station|halt|tram_stop/) || publicTransport.match(/stop_position|platform/)) return { type: 'transport', labelEn: 'Transit Station', labelNl: 'OV-Station / Halte' };

  // Food — supermarkten én voedselbanken
  if (amenity.match(/food_bank|soup_kitchen/) || socialFacility.match(/food_bank|soup_kitchen/) || name.match(/voedselbank|soepkeuken/)) return { type: 'food', labelEn: 'Food Bank / Soup Kitchen', labelNl: 'Voedselbank / Soepkeuken' };
  if (shop.match(/supermarket|convenience|greengrocer|bakery/)) return { type: 'food', labelEn: 'Supermarket / Grocery', labelNl: 'Supermarkt / Buurtwinkel' };

  // Healthcare
  if (amenity === 'pharmacy') return { type: 'healthcare', labelEn: 'Pharmacy', labelNl: 'Apotheek' };
  if (amenity === 'hospital' || healthcare === 'hospital') return { type: 'healthcare', labelEn: 'Hospital', labelNl: 'Ziekenhuis' };
  if (amenity === 'doctors' || amenity === 'clinic' || healthcare === 'doctor') return { type: 'healthcare', labelEn: 'Doctor / Clinic', labelNl: 'Huisarts / Kliniek' };

  // School
  if (amenity.match(/school|kindergarten|childcare|college/)) return { type: 'school', labelEn: 'School / Childcare', labelNl: 'School / Kinderopvang' };

  // Green
  if (leisure.match(/park|garden|nature_reserve|recreation_ground/)) return { type: 'green', labelEn: 'Park / Green Space', labelNl: 'Park / Groenvoorziening' };

  // Housing
  if (building.match(/residential|apartments|house|terrace/)) return { type: 'housing', labelEn: 'Residential', labelNl: 'Woonhuis / Appartement' };

  // Social — opvang, buurtcentra, inloophuizen, daklozen
  if (socialFacility === 'homeless_shelter' || name.match(/dakloos|nacht/)) return { type: 'social', labelEn: 'Homeless Shelter', labelNl: 'Daklozenopvang' };
  if (amenity === 'community_centre' || name.match(/buurt|wijkcentrum/)) return { type: 'social', labelEn: 'Community Centre', labelNl: 'Buurtcentrum' };
  if (amenity === 'social_facility' || name.match(/inloop|dagcentrum/)) return { type: 'social', labelEn: 'Social Facility / Day Centre', labelNl: 'Maatschappelijke Voorziening / Dagcentrum' };

  return { type: 'social', labelEn: 'Social Facility', labelNl: 'Maatschappelijke Voorziening' };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchNearbyAmenities(
  latlng: LatLng,
  radiusMeters = 1000
): Promise<Amenity[]> {
  const query = buildOverpassQuery(latlng.lat, latlng.lng, radiusMeters);
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
    });
    if (!res.ok) return mockAmenities(latlng);
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elements: any[] = data.elements ?? [];
    // Deduplicate by id
    const seen = new Set<string>();
    return elements
      .filter((el) => el.tags && !seen.has(String(el.id)) && seen.add(String(el.id)))
      .map((el, i) => {
        const elLat = el.lat ?? el.center?.lat ?? latlng.lat;
        const elLng = el.lon ?? el.center?.lon ?? latlng.lng;
        // Prefer Dutch name, then international name
        const name =
          el.tags['name:nl'] ??
          el.tags.name ??
          el.tags['social_facility'] ??
          el.tags.amenity ??
          el.tags.shop ??
          el.tags.healthcare ??
          'Voorziening';
        const typeInfo = getTypeFromTags(el.tags);
        const website = el.tags.website ?? el.tags['contact:website'];
        return {
          id: String(el.id ?? i),
          type: typeInfo.type,
          name,
          amenityTypeLabel: { en: typeInfo.labelEn, nl: typeInfo.labelNl },
          website: website?.startsWith('http') ? website : (website ? `https://${website}` : undefined),
          coordinates: { lat: elLat, lng: elLng },
          distanceMeters: haversineDistance(latlng.lat, latlng.lng, elLat, elLng),
        } as Amenity;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 120);
  } catch {
    return mockAmenities(latlng);
  }
}

// Fallback mock data — extended Dutch social care facilities
function mockAmenities(center: LatLng): Amenity[] {
  return [
    { id: 'm1',  type: 'food',       name: 'Albert Heijn',              amenityTypeLabel: { en: 'Supermarket', nl: 'Supermarkt' }, website: 'https://ah.nl', coordinates: { lat: center.lat + 0.002,  lng: center.lng + 0.003  }, distanceMeters: 320 },
    { id: 'm1b', type: 'food',       name: 'Voedselbank Utrecht',        amenityTypeLabel: { en: 'Food Bank', nl: 'Voedselbank' }, website: 'https://voedselbankutrecht.nl', coordinates: { lat: center.lat - 0.004,  lng: center.lng + 0.002  }, distanceMeters: 680 },
    { id: 'm2',  type: 'healthcare', name: 'Huisartsenpraktijk',         amenityTypeLabel: { en: 'Doctor', nl: 'Huisarts' }, coordinates: { lat: center.lat - 0.003,  lng: center.lng + 0.001  }, distanceMeters: 480 },
    { id: 'm2b', type: 'healthcare', name: 'Apotheek de Leeuw',          amenityTypeLabel: { en: 'Pharmacy', nl: 'Apotheek' }, coordinates: { lat: center.lat + 0.001,  lng: center.lng + 0.003  }, distanceMeters: 260 },
    { id: 'm3',  type: 'transport',  name: 'Bushalte Kanaalstraat',      amenityTypeLabel: { en: 'Bus Stop', nl: 'Bushalte' }, coordinates: { lat: center.lat + 0.001,  lng: center.lng - 0.002  }, distanceMeters: 150 },
    { id: 'm4',  type: 'school',     name: 'Basisschool De Brug',        amenityTypeLabel: { en: 'School', nl: 'Basisschool' }, coordinates: { lat: center.lat - 0.001,  lng: center.lng + 0.004  }, distanceMeters: 650 },
    { id: 'm5',  type: 'green',      name: 'Stadspark',                  amenityTypeLabel: { en: 'Park', nl: 'Stadspark' }, coordinates: { lat: center.lat + 0.004,  lng: center.lng - 0.001  }, distanceMeters: 550 },
    { id: 'm6',  type: 'social',     name: 'Wijkcentrum De Meern',       amenityTypeLabel: { en: 'Community Centre', nl: 'Buurtcentrum' }, website: 'https://utrecht.nl', coordinates: { lat: center.lat - 0.002,  lng: center.lng - 0.003  }, distanceMeters: 380 },
    { id: 'm6b', type: 'social',     name: 'Nachtopvang Leger des Heils', amenityTypeLabel: { en: 'Homeless Shelter', nl: 'Nachtopvang' }, website: 'https://legerdesheils.nl', coordinates: { lat: center.lat + 0.003, lng: center.lng - 0.002  }, distanceMeters: 490 },
    { id: 'm6c', type: 'social',     name: 'Dagopvang Stichting',        amenityTypeLabel: { en: 'Day Centre', nl: 'Dagopvang' }, coordinates: { lat: center.lat - 0.001,  lng: center.lng - 0.004  }, distanceMeters: 570 },
    { id: 'm7',  type: 'sanitation', name: 'Openbare WC',                amenityTypeLabel: { en: 'Public Toilet', nl: 'Openbaar Toilet' }, coordinates: { lat: center.lat + 0.001,  lng: center.lng + 0.001  }, distanceMeters: 200 },
    { id: 'm7b', type: 'sanitation', name: 'Publieke Douches GGD',       amenityTypeLabel: { en: 'Public Shower', nl: 'Openbare Douche' }, coordinates: { lat: center.lat - 0.002,  lng: center.lng + 0.002  }, distanceMeters: 430 },
    { id: 'm7c', type: 'sanitation', name: 'Wasserette',                  amenityTypeLabel: { en: 'Laundromat', nl: 'Wasserette' }, coordinates: { lat: center.lat + 0.003,  lng: center.lng + 0.001  }, distanceMeters: 510 },
  ];
}
