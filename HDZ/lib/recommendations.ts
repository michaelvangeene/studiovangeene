import type { Amenity, LayerScore, ProgramData, Recommendation } from '@/types/hdz';

export function generateRecommendations(
  layers: Record<string, LayerScore>,
  program: ProgramData,
  amenities: Amenity[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Basic Needs
  if (layers.basicNeeds.score < 18) {
    const foodAmens = amenities.filter((a) => a.type === 'food');
    if (foodAmens.length === 0 || Math.min(...foodAmens.map((a) => a.distanceMeters)) > 500) {
      recs.push({
        id: 'add-food-access',
        priority: 'high',
        messageEn: 'No food provider within 500m. Ensure access to a supermarket or food bank.',
        messageNl: 'Geen voedselvoorziening binnen 500m. Zorg voor toegang tot een supermarkt of voedselbank.',
        layer: 'basicNeeds',
      });
    }
    const careAmens = amenities.filter((a) => a.type === 'healthcare');
    if (careAmens.length === 0 || Math.min(...careAmens.map((a) => a.distanceMeters)) > 1000) {
      recs.push({
        id: 'add-healthcare',
        priority: 'high',
        messageEn: 'No healthcare within 1km. A GP or clinic should be accessible.',
        messageNl: 'Geen gezondheidszorg binnen 1km. Een huisarts of kliniek moet bereikbaar zijn.',
        layer: 'basicNeeds',
      });
    }
  }

  // Governance
  if (program.management === 'none') {
    recs.push({
      id: 'add-management',
      priority: 'high',
      messageEn: 'Add a management layer — at minimum daytime supervision is recommended.',
      messageNl: 'Voeg een beheerlaag toe — minimaal dagelijks toezicht wordt aanbevolen.',
      layer: 'governance',
    });
  } else if (program.management === 'daytime' && program.residents > 100) {
    recs.push({
      id: 'upgrade-management',
      priority: 'medium',
      messageEn: 'Scale of program requires 24/7 supervision — upgrade management level.',
      messageNl: 'Schaal van het programma vereist 24/7 toezicht — verhoog het beheersniveau.',
      layer: 'governance',
    });
  }

  // Impact
  if (layers.impact.score < 12) {
    recs.push({
      id: 'reduce-impact',
      priority: 'medium',
      messageEn: 'Consider reducing resident count or creating buffer zones around the site.',
      messageNl: 'Overweeg het verminderen van het bewonersaantal of bufferzone om de locatie.',
      layer: 'impact',
    });
  }

  // Spatial Fit
  if (layers.spatialFit.score < 12) {
    recs.push({
      id: 'improve-spatial-fit',
      priority: 'medium',
      messageEn: 'Program scale or type conflicts with urban context — consider a mixed-use zone.',
      messageNl: 'Programma past niet goed in de stedelijke context — overweeg een gemengde bestemming.',
      layer: 'spatialFit',
    });
  }

  // Policy
  if (layers.policyFit.score < 9) {
    recs.push({
      id: 'review-policy-alignment',
      priority: 'medium',
      messageEn: 'Review alignment with municipal spatial planning documents.',
      messageNl: 'Herzie afstemming met gemeentelijke ruimtelijke ordeningsdocumenten.',
      layer: 'policyFit',
    });
  }

  // Sanitation
  const sanitationAmens = amenities.filter((a) => a.type === 'sanitation');
  if (sanitationAmens.length === 0) {
    recs.push({
      id: 'add-sanitation',
      priority: 'high',
      messageEn: 'No sanitation facilities found. Add toilet/shower access within the program.',
      messageNl: 'Geen sanitaire voorzieningen gevonden. Voeg toilet/douchetoegang toe aan het programma.',
      layer: 'basicNeeds',
    });
  }

  return recs;
}
