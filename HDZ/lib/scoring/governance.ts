import type { LayerScore, ProgramData } from '@/types/hdz';

/** Layer D: Governance — max 20 */
export function scoreGovernance(program: ProgramData): LayerScore {
  // Management presence (max 8)
  const managementMap: Record<string, number> = {
    none: 0,
    daytime: 4,
    '24_7': 7,
    care_based: 8,
  };
  const managementScore = managementMap[program.management] ?? 0;

  // Institutional links — derived from housing type (max 4)
  const institutionalMap: Record<string, number> = {
    asylum_center: 4,
    homeless_shelter: 3,
    migrant_housing: 3,
    mixed_housing: 3,
    temporary_housing: 2,
  };
  const institutionalScore = institutionalMap[program.housingType] ?? 2;

  // Rules / protocols — implied by management type (max 4)
  const protocolMap: Record<string, number> = {
    none: 0,
    daytime: 2,
    '24_7': 4,
    care_based: 4,
  };
  const protocolScore = protocolMap[program.management] ?? 0;

  // Supervision ratio (residents per supervisor) (max 4)
  // Better ratio = higher score
  let supervisionScore = 0;
  if (program.management === 'none') {
    supervisionScore = 0;
  } else if (program.management === 'care_based') {
    supervisionScore = program.residents <= 30 ? 4 : program.residents <= 60 ? 3 : 2;
  } else if (program.management === '24_7') {
    supervisionScore = program.residents <= 50 ? 4 : program.residents <= 100 ? 3 : program.residents <= 200 ? 2 : 1;
  } else {
    supervisionScore = program.residents <= 30 ? 3 : program.residents <= 80 ? 2 : 1;
  }

  const total = managementScore + institutionalScore + protocolScore + supervisionScore;

  return {
    key: 'governance',
    labelEn: 'Governance',
    labelNl: 'Beheer & Bestuur',
    score: Math.min(20, total),
    max: 20,
    subScores: [
      { key: 'management', labelEn: 'Management Presence', labelNl: 'Beheeraanwezigheid', score: managementScore, max: 8 },
      { key: 'institutional', labelEn: 'Institutional Links', labelNl: 'Institutionele Verbanden', score: institutionalScore, max: 4 },
      { key: 'protocol', labelEn: 'Rules & Protocols', labelNl: 'Regels & Protocollen', score: protocolScore, max: 4 },
      { key: 'supervision', labelEn: 'Supervision Ratio', labelNl: 'Toezichtsratio', score: supervisionScore, max: 4 },
    ],
  };
}
