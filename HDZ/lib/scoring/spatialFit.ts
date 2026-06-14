import type { LayerScore, LocationData, ProgramData } from '@/types/hdz';

/** Layer B: Spatial Fit — max 20 */
export function scoreSpatialFit(
  location: LocationData | null,
  program: ProgramData
): LayerScore {
  const zone = location?.zoneType ?? 'unknown';

  // Urban density fit (max 6)
  // Larger programs need mixed/commercial zones; smaller ones fit in residential
  const densityMap: Record<string, Record<string, number>> = {
    residential: { temporary_housing: 5, asylum_center: 2, homeless_shelter: 3, migrant_housing: 4, mixed_housing: 4 },
    mixed: { temporary_housing: 6, asylum_center: 5, homeless_shelter: 5, migrant_housing: 6, mixed_housing: 6 },
    commercial: { temporary_housing: 4, asylum_center: 4, homeless_shelter: 3, migrant_housing: 4, mixed_housing: 5 },
    industrial: { temporary_housing: 2, asylum_center: 3, homeless_shelter: 2, migrant_housing: 3, mixed_housing: 2 },
    rural: { temporary_housing: 1, asylum_center: 2, homeless_shelter: 1, migrant_housing: 2, mixed_housing: 1 },
    unknown: { temporary_housing: 3, asylum_center: 3, homeless_shelter: 3, migrant_housing: 3, mixed_housing: 3 },
  };
  const densityScore = densityMap[zone]?.[program.housingType] ?? 3;

  // Footprint compatibility — residents vs zone capacity (max 4)
  let footprintScore = 4;
  if (program.residents > 200 && zone === 'residential') footprintScore = 1;
  else if (program.residents > 100 && zone === 'residential') footprintScore = 2;
  else if (program.residents > 300 && zone === 'mixed') footprintScore = 2;
  else if (program.residents > 200) footprintScore = 3;

  // Height context (simulated proxy — smaller programs = better fit) (max 4)
  const heightScore = program.residents <= 30 ? 4 : program.residents <= 100 ? 3 : program.residents <= 250 ? 2 : 1;

  // Program compatibility with zone (max 6)
  const compatMap: Record<string, number> = {
    mixed: 6,
    residential: 5,
    commercial: 4,
    industrial: 2,
    rural: 2,
    unknown: 3,
  };
  const compatScore = compatMap[zone] ?? 3;

  const total = densityScore + footprintScore + heightScore + compatScore;

  return {
    key: 'spatialFit',
    labelEn: 'Spatial Fit',
    labelNl: 'Ruimtelijke Inpassing',
    score: Math.min(20, total),
    max: 20,
    subScores: [
      { key: 'density', labelEn: 'Density Fit', labelNl: 'Dichtheidsgeschiktheid', score: densityScore, max: 6 },
      { key: 'footprint', labelEn: 'Footprint', labelNl: 'Ruimtebeslag', score: footprintScore, max: 4 },
      { key: 'height', labelEn: 'Height Context', labelNl: 'Hoogte Context', score: heightScore, max: 4 },
      { key: 'compat', labelEn: 'Program Compatibility', labelNl: 'Programma Compatibiliteit', score: compatScore, max: 6 },
    ],
  };
}
