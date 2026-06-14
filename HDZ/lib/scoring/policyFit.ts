import type { Amenity, LayerScore, LocationData, ProgramData } from '@/types/hdz';

/** Layer E: Policy Fit — max 15 */
export function scorePolicyFit(
  location: LocationData | null,
  program: ProgramData,
  amenities: Amenity[]
): LayerScore {
  const zone = location?.zoneType ?? 'unknown';

  // Alignment with spatial policy (zoning) (max 5)
  const policyAlignMap: Record<string, Record<string, number>> = {
    mixed: { asylum_center: 5, homeless_shelter: 5, migrant_housing: 5, temporary_housing: 5, mixed_housing: 5 },
    residential: { asylum_center: 2, homeless_shelter: 3, migrant_housing: 3, temporary_housing: 4, mixed_housing: 3 },
    commercial: { asylum_center: 4, homeless_shelter: 3, migrant_housing: 4, temporary_housing: 4, mixed_housing: 4 },
    industrial: { asylum_center: 2, homeless_shelter: 2, migrant_housing: 3, temporary_housing: 2, mixed_housing: 2 },
    rural: { asylum_center: 3, homeless_shelter: 1, migrant_housing: 2, temporary_housing: 2, mixed_housing: 1 },
    unknown: { asylum_center: 3, homeless_shelter: 3, migrant_housing: 3, temporary_housing: 3, mixed_housing: 3 },
  };
  const policyAlignScore = policyAlignMap[zone]?.[program.housingType] ?? 3;

  // Target group relevance (duration + housing type) (max 5)
  const targetRelevanceMap: Record<string, Record<string, number>> = {
    short: { temporary_housing: 5, asylum_center: 4, homeless_shelter: 4, migrant_housing: 3, mixed_housing: 3 },
    medium: { temporary_housing: 4, asylum_center: 5, homeless_shelter: 4, migrant_housing: 4, mixed_housing: 4 },
    permanent: { temporary_housing: 2, asylum_center: 2, homeless_shelter: 3, migrant_housing: 4, mixed_housing: 5 },
  };
  const targetScore = targetRelevanceMap[program.duration]?.[program.housingType] ?? 3;

  // Proximity to services composite (max 5)
  const nearbyServices = amenities.filter((a) => a.distanceMeters <= 500).length;
  const proximityScore = nearbyServices === 0 ? 0 : nearbyServices <= 2 ? 2 : nearbyServices <= 5 ? 3 : nearbyServices <= 8 ? 4 : 5;

  const total = policyAlignScore + targetScore + proximityScore;

  return {
    key: 'policyFit',
    labelEn: 'Policy Fit',
    labelNl: 'Beleidsafstemming',
    score: Math.min(15, total),
    max: 15,
    subScores: [
      { key: 'policyAlign', labelEn: 'Spatial Policy Alignment', labelNl: 'Ruimtelijk Beleid', score: policyAlignScore, max: 5 },
      { key: 'targetGroup', labelEn: 'Target Group Relevance', labelNl: 'Doelgroepgeschiktheid', score: targetScore, max: 5 },
      { key: 'proximity', labelEn: 'Proximity to Services', labelNl: 'Nabijheid Voorzieningen', score: proximityScore, max: 5 },
    ],
  };
}
