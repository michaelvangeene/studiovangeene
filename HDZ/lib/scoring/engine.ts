import type {
  Amenity,
  LayerScore,
  ProgramData,
  LocationData,
  HDZScore,
  HDZCategory,
  RedFlag,
  Recommendation,
} from '@/types/hdz';
import { scoreBasicNeeds } from './basicNeeds';
import { scoreSpatialFit } from './spatialFit';
import { scoreImpact } from './impact';
import { scoreGovernance } from './governance';
import { scorePolicyFit } from './policyFit';
import { generateRecommendations } from '../recommendations';

export function calculateHDZScore(
  location: LocationData | null,
  program: ProgramData,
  amenities: Amenity[]
): HDZScore {
  const basicNeeds = scoreBasicNeeds(amenities, program);
  const spatialFit = scoreSpatialFit(location, program);
  const impact = scoreImpact(amenities, program, location);
  const governance = scoreGovernance(program);
  const policyFit = scorePolicyFit(location, program, amenities);

  const total =
    basicNeeds.score +
    spatialFit.score +
    impact.score +
    governance.score +
    policyFit.score;

  const category = getCategory(total);
  const legallyDefensible = total >= 55 && governance.score >= 12;

  const layers: Record<string, LayerScore> = {
    basicNeeds,
    spatialFit,
    impact,
    governance,
    policyFit,
  };

  const redFlags = buildRedFlags(layers as Record<string, LayerScore>, program);
  const recommendations = generateRecommendations(
    layers as Record<string, LayerScore>,
    program,
    amenities
  );

  return {
    total,
    category,
    layers: layers as HDZScore['layers'],
    legallyDefensible,
    redFlags,
    recommendations,
  };
}

function getCategory(total: number): HDZCategory {
  if (total >= 75) return 'strong';
  if (total >= 50) return 'moderate';
  if (total >= 25) return 'weak';
  return 'critical';
}

function buildRedFlags(
  layers: Record<string, LayerScore>,
  program: ProgramData
): RedFlag[] {
  const flags: RedFlag[] = [];

  if (layers.basicNeeds.score < 10) {
    flags.push({
      id: 'basic-needs-critical',
      severity: 'error',
      messageEn: 'Basic needs score critically low — essential services are absent or too far.',
      messageNl: 'Basisscore extreem laag — essentiële voorzieningen ontbreken of liggen te ver.',
      layer: 'basicNeeds',
    });
  } else if (layers.basicNeeds.score < 15) {
    flags.push({
      id: 'basic-needs-low',
      severity: 'warning',
      messageEn: 'Basic needs score below threshold — improve access to food, care, or sanitation.',
      messageNl: 'Basisscore onder drempelwaarde — verbeter toegang tot voedsel, zorg of sanitair.',
      layer: 'basicNeeds',
    });
  }

  if (program.management === 'none' && program.residents > 20) {
    flags.push({
      id: 'governance-missing',
      severity: 'error',
      messageEn: 'No management layer defined for a large-scale program. Not legally defensible.',
      messageNl: 'Geen beheerlaag voor een grootschalig programma. Juridisch niet verdedigbaar.',
      layer: 'governance',
    });
  }

  if (layers.impact.score < 8) {
    flags.push({
      id: 'impact-high',
      severity: 'warning',
      messageEn: 'High impact on surroundings — consider clustering, routing, or scale reduction.',
      messageNl: 'Hoge impact op omgeving — overweeg clustering, routing of schaalreductie.',
      layer: 'impact',
    });
  }

  if (layers.spatialFit.score < 8) {
    flags.push({
      id: 'spatial-fit-poor',
      severity: 'warning',
      messageEn: 'Poor spatial fit — program scale or type conflicts with the urban context.',
      messageNl: 'Slechte ruimtelijke inpassing — programma past niet bij stedelijke context.',
      layer: 'spatialFit',
    });
  }

  if (layers.policyFit.score < 6) {
    flags.push({
      id: 'policy-misalignment',
      severity: 'warning',
      messageEn: 'Weak policy alignment — review zoning and target group appropriateness.',
      messageNl: 'Zwakke beleidsafstemming — herzie bestemming en doelgroepgeschiktheid.',
      layer: 'policyFit',
    });
  }

  return flags;
}
