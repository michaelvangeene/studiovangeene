import type { Amenity, LayerScore, ProgramData } from '@/types/hdz';

/** Layer A: Basic Needs — max 25 */
export function scoreBasicNeeds(
  amenities: Amenity[],
  program: ProgramData
): LayerScore {
  const food = amenities.filter((a) => a.type === 'food');
  const care = amenities.filter((a) => a.type === 'healthcare');
  const sanitation = amenities.filter((a) => a.type === 'sanitation');
  const social = amenities.filter((a) => a.type === 'social');

  // Food access (max 6)
  const nearestFood = food.length > 0 ? Math.min(...food.map((a) => a.distanceMeters)) : 9999;
  const foodScore = nearestFood <= 300 ? 6 : nearestFood <= 500 ? 4 : nearestFood <= 1000 ? 2 : 0;

  // Sanitation (max 5) — based on presence within 500m
  const sanitationCount = sanitation.filter((a) => a.distanceMeters <= 500).length;
  const sanitationScore = Math.min(5, sanitationCount * 2);

  // Healthcare (max 6)
  const nearestCare = care.length > 0 ? Math.min(...care.map((a) => a.distanceMeters)) : 9999;
  const careScore = nearestCare <= 300 ? 6 : nearestCare <= 500 ? 4 : nearestCare <= 1000 ? 2 : 0;

  // Housing stability from program type (max 4)
  const stabilityMap: Record<string, number> = {
    temporary_housing: 2,
    asylum_center: 2,
    homeless_shelter: 2,
    migrant_housing: 3,
    mixed_housing: 4,
  };
  const stabilityScore = stabilityMap[program.housingType] ?? 2;

  // Network completeness bonus (max 4) — reward having all services
  const hasAll = food.length > 0 && care.length > 0 && sanitation.length > 0;
  const hasSocial = social.length > 0;
  const networkScore = hasAll ? (hasSocial ? 4 : 3) : hasAll ? 2 : food.length > 0 ? 1 : 0;

  const total = foodScore + sanitationScore + careScore + stabilityScore + networkScore;

  return {
    key: 'basicNeeds',
    labelEn: 'Basic Needs',
    labelNl: 'Basisbehoeften',
    score: Math.min(25, total),
    max: 25,
    subScores: [
      { key: 'food', labelEn: 'Food Access', labelNl: 'Voedselaccess', score: foodScore, max: 6 },
      { key: 'sanitation', labelEn: 'Sanitation', labelNl: 'Sanitair', score: sanitationScore, max: 5 },
      { key: 'care', labelEn: 'Healthcare', labelNl: 'Gezondheidszorg', score: careScore, max: 6 },
      { key: 'stability', labelEn: 'Housing Stability', labelNl: 'Woonzekerheid', score: stabilityScore, max: 4 },
      { key: 'network', labelEn: 'Network Completeness', labelNl: 'Voorzieningennetwerk', score: networkScore, max: 4 },
    ],
  };
}
