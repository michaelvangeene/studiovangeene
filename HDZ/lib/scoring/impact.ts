import type { Amenity, LayerScore, LocationData, ProgramData } from '@/types/hdz';

/** Layer C: Impact — max 20 */
export function scoreImpact(
  amenities: Amenity[],
  program: ProgramData,
  location: LocationData | null
): LayerScore {
  const zone = location?.zoneType ?? 'unknown';

  // Distance to residential housing — prefer buffer (max 5)
  // Simulated: mixed/industrial = good buffer, residential = conflict
  const residentialDistScore =
    zone === 'industrial' ? 5 : zone === 'commercial' ? 4 : zone === 'mixed' ? 4 : zone === 'residential' ? 2 : 3;

  // Routing conflicts — schools nearby are conflict (max 5)
  const schools = amenities.filter((a) => a.type === 'school');
  const nearbySchools = schools.filter((a) => a.distanceMeters <= 200).length;
  const routingScore = nearbySchools === 0 ? 5 : nearbySchools === 1 ? 3 : 1;

  // Noise / intensity from resident count (max 5)
  const intensityScore =
    program.residents <= 20 ? 5 : program.residents <= 50 ? 4 : program.residents <= 100 ? 3 : program.residents <= 200 ? 2 : 1;

  // Clustering of vulnerable groups — social services concentration (max 5)
  const socialFacilities = amenities.filter(
    (a) => a.type === 'social' || a.type === 'healthcare'
  ).filter((a) => a.distanceMeters <= 500).length;
  const clusteringScore =
    socialFacilities <= 2 ? 5 : socialFacilities <= 4 ? 4 : socialFacilities <= 6 ? 3 : socialFacilities <= 8 ? 2 : 1;

  const total = residentialDistScore + routingScore + intensityScore + clusteringScore;

  return {
    key: 'impact',
    labelEn: 'Impact',
    labelNl: 'Omgevingsimpact',
    score: Math.min(20, total),
    max: 20,
    subScores: [
      { key: 'residential', labelEn: 'Distance to Residential', labelNl: 'Afstand tot Woongebied', score: residentialDistScore, max: 5 },
      { key: 'routing', labelEn: 'Routing Conflicts', labelNl: 'Routeconflicten', score: routingScore, max: 5 },
      { key: 'intensity', labelEn: 'Noise / Intensity', labelNl: 'Geluid / Intensiteit', score: intensityScore, max: 5 },
      { key: 'clustering', labelEn: 'Clustering Index', labelNl: 'Clusteringsindex', score: clusteringScore, max: 5 },
    ],
  };
}
