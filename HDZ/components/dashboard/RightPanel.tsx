'use client';

import { useHDZ } from '@/context/HDZContext';
import HDZGauge from '@/components/scoring/HDZGauge';
import type { LayerKey } from '@/types/hdz';

const LAYER_COLORS: Record<LayerKey, string> = {
  basicNeeds: '#10b981', spatialFit: '#3b82f6', impact: '#f97316', governance: '#8b5cf6', policyFit: '#06b6d4',
};

const t = {
  en: {
    totalScore: 'Total HDZ Score', noScore: 'Select a location to calculate score',
    scoreCategory: 'Score category', recommendations: 'Recommendations',
    locationDetails: 'Location Details', documents: 'Documents',
    address: 'Address', neighborhood: 'Neighbourhood', zone: 'Zoning', postcode: 'Postcode', municipality: 'Municipality',
    unknown: 'Unknown', noRecs: 'Score is strong — no major issues.',
    docBestemmingsplan: 'Bestemmingsplan.pdf', docBuurt: 'Buurtanalyse.pdf', docVoorzieningen: 'Voorzieningenkaart.pdf',
    addDoc: '+ Add document', scenarioBtn: 'Explore Scenario',
    indicative: 'Indicative score — based on OSM data',
  },
  nl: {
    totalScore: 'Totaal HDZ Score', noScore: 'Selecteer een locatie om de score te berekenen',
    scoreCategory: 'Score categorie', recommendations: 'Aanbevelingen',
    locationDetails: 'Details Locatie', documents: 'Documenten',
    address: 'Adres', neighborhood: 'Wijk', zone: 'Bestemming', postcode: 'Postcode', municipality: 'Gemeente',
    unknown: 'Onbekend', noRecs: 'Score is sterk — geen grote aandachtspunten.',
    docBestemmingsplan: 'Bestemmingsplan.pdf', docBuurt: 'Buurtanalyse.pdf', docVoorzieningen: 'Voorzieningenkaart.pdf',
    addDoc: '+ Document toevoegen', scenarioBtn: 'Scenario verkennen',
    indicative: 'Indicatieve score — gebaseerd op OSM-data',
  },
};

const REC_ICONS: Record<string, string> = {
  high: '⚠️', medium: 'ℹ️', low: '✅',
};
const REC_COLORS: Record<string, string> = {
  high: '#ef4444', medium: '#f59e0b', low: '#10b981',
};

export default function RightPanel() {
  const { state } = useHDZ();
  const lang = state.language;
  const tx = t[lang];
  const score = state.score;
  const loc = state.location;

  const catLabel = {
    en: { strong: 'Strong', moderate: 'Moderate', weak: 'Weak', critical: 'Critical' },
    nl: { strong: 'Sterk', moderate: 'Matig', weak: 'Zwak', critical: 'Kritiek' },
  }[lang];
  const catColor = { strong: '#10b981', moderate: '#f59e0b', weak: '#f97316', critical: '#ef4444' };

  return (
    <aside className="flex flex-col h-full bg-[#0d1117] border-l border-[#1e293b] overflow-y-auto">

      {/* Total HDZ Score */}
      <div className="p-4 border-b border-[#1e293b]">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-3">{tx.totalScore}</h3>
        {!score ? (
          <p className="text-[10px] text-[#475569] italic text-center py-4">{tx.noScore}</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <HDZGauge score={score.total} category={score.category} legallyDefensible={score.legallyDefensible} language={lang} />
            <p className="text-[9px] text-[#334155] italic text-center">{tx.indicative}</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {score && (
        <div className="p-4 border-b border-[#1e293b]">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-2.5">{tx.recommendations}</h3>
          {score.recommendations.length === 0 && score.redFlags.length === 0 ? (
            <p className="text-[10px] text-[#10b981] italic">{tx.noRecs}</p>
          ) : (
            <div className="space-y-2">
              {/* Red flags first */}
              {score.redFlags.map((f) => (
                <div key={f.id} className="flex gap-2 items-start p-2 rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/20">
                  <span className="text-xs flex-shrink-0 mt-0.5">🔴</span>
                  <p className="text-[10px] text-[#fca5a5] leading-snug">{lang === 'nl' ? f.messageNl : f.messageEn}</p>
                </div>
              ))}
              {/* Recommendations */}
              {score.recommendations.slice(0, 4).map((r) => (
                <div key={r.id} className="flex gap-2 items-start p-2 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-xs flex-shrink-0 mt-0.5">{REC_ICONS[r.priority] ?? 'ℹ️'}</span>
                  <div>
                    <p className="text-[10px] text-[#94a3b8] leading-snug">{lang === 'nl' ? r.messageNl : r.messageEn}</p>
                    <span className="text-[8px] font-bold mt-0.5 block" style={{ color: REC_COLORS[r.priority] }}>
                      {r.priority === 'high' ? (lang === 'nl' ? 'Hoge prioriteit' : 'High priority') : r.priority === 'medium' ? (lang === 'nl' ? 'Gemiddeld' : 'Medium') : (lang === 'nl' ? 'Laag' : 'Low')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {score && (
            <button className="mt-3 w-full py-1.5 rounded-lg bg-[#6d28d9]/20 border border-[#6d28d9]/40 text-[10px] font-bold text-[#a78bfa] hover:bg-[#6d28d9]/30 transition-colors uppercase tracking-wider">
              {tx.scenarioBtn}
            </button>
          )}
        </div>
      )}

      {/* Location Details */}
      <div className="p-4 border-b border-[#1e293b]">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-2.5">{tx.locationDetails}</h3>
        {!loc ? (
          <p className="text-[10px] text-[#475569] italic">{tx.noScore}</p>
        ) : (
          <div className="space-y-1.5">
            {[
              { label: tx.address, value: loc.address.split(',').slice(0, 2).join(',') },
              { label: tx.neighborhood, value: loc.neighborhood },
              { label: tx.municipality, value: loc.municipality },
              { label: tx.postcode, value: loc.postcode },
              { label: tx.zone, value: loc.zoneType ? loc.zoneType.replace('_', ' ') : undefined },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-2">
                <span className="text-[9px] text-[#475569] flex-shrink-0">{label}</span>
                <span className="text-[9px] text-[#94a3b8] font-medium text-right leading-snug">{value || tx.unknown}</span>
              </div>
            ))}
            {score && (
              <>
                <div className="h-px bg-[#1e293b] my-1" />
                {(Object.keys(score.layers) as LayerKey[]).map((k) => {
                  const l = score.layers[k];
                  const pct = Math.round((l.score / l.max) * 100);
                  return (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-[9px] text-[#475569]">{lang === 'nl' ? l.labelNl : l.labelEn}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: LAYER_COLORS[k] }} />
                        </div>
                        <span className="text-[9px] font-semibold" style={{ color: LAYER_COLORS[k] }}>{l.score}/{l.max}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="p-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-2.5">{tx.documents}</h3>
        <div className="space-y-1.5">
          {[tx.docBestemmingsplan, tx.docBuurt, tx.docVoorzieningen].map((doc) => (
            <div key={doc} className="flex items-center justify-between p-2 rounded-md bg-[#111827] border border-[#1e293b] hover:border-[#334155] transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-[10px]">📄</span>
                <span className="text-[10px] text-[#64748b]">{doc}</span>
              </div>
              <svg className="w-3 h-3 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
          ))}
          <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors">{tx.addDoc}</button>
        </div>
      </div>
    </aside>
  );
}
