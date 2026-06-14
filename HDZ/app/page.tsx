'use client';

import { useState } from 'react';
import { HDZProvider, useHDZ } from '@/context/HDZContext';
import LeftPanel from '@/components/dashboard/LeftPanel';
import MapPanel from '@/components/map/MapPanel';
import RightPanel from '@/components/dashboard/RightPanel';
import ScoreCards from '@/components/scoring/ScoreCards';
import ExportButton from '@/components/ui/ExportButton';
import type { Language, LayerKey } from '@/types/hdz';

type NavTab = 'dashboard' | 'kaart' | 'scenarios' | 'vergelijken' | 'rapport';

const NAV_LABELS: Record<NavTab, { en: string; nl: string }> = {
  dashboard: { en: 'Dashboard', nl: 'Dashboard' },
  kaart: { en: 'Map', nl: 'Kaart' },
  scenarios: { en: "Scenario's", nl: "Scenario's" },
  vergelijken: { en: 'Compare', nl: 'Vergelijken' },
  rapport: { en: 'Report', nl: 'Rapport' },
};

const INTERP = [
  { range: '80–100', labelNl: 'Zeer sterk', labelEn: 'Very strong', subNl: 'Zeer goed verdedigbaar', subEn: 'Very well defensible', color: '#10b981' },
  { range: '65–80', labelNl: 'Sterk', labelEn: 'Strong', subNl: 'Kansrijk met kleine aanpassingen', subEn: 'Good with minor adjustments', color: '#22c55e' },
  { range: '50–65', labelNl: 'Matig', labelEn: 'Moderate', subNl: 'Hoog risico op bezwaren', subEn: 'Risk of objections', color: '#f59e0b' },
  { range: '0–50', labelNl: 'Zwak / Kritiek', labelEn: 'Weak / Critical', subNl: 'Grote kans op juridische problemen', subEn: 'High risk of legal issues', color: '#ef4444' },
];

function Dashboard() {
  const { state, setLanguage } = useHDZ();
  const lang = state.language;
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const score = state.score;

  const catColor = score
    ? { strong: '#10b981', moderate: '#f59e0b', weak: '#f97316', critical: '#ef4444' }[score.category]
    : null;

  return (
    <div className="h-screen flex flex-col bg-[#0a0e1a] overflow-hidden">

      {/* ── Top navigation bar ── */}
      <header className="flex-shrink-0 h-11 bg-[#0d1117] border-b border-[#1e293b] flex items-center px-4 gap-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-white leading-none">HDZ</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-white tracking-tight leading-none">HDZ</p>
            <p className="text-[7px] text-[#475569] leading-none tracking-wide uppercase">Assessment Dashboard</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-0 flex-1">
          {(Object.keys(NAV_LABELS) as NavTab[]).map((tab) => (
            <button
              key={tab}
              id={`nav-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 h-11 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab ? 'text-white' : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              {NAV_LABELS[tab][lang]}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />
              )}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live score in header */}
          {score && catColor && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold"
              style={{ color: catColor, borderColor: catColor + '40', background: catColor + '12' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: catColor }} />
              {score.total}/100
            </div>
          )}

          <ExportButton />

          {/* Language toggle */}
          <div className="flex bg-[#111827] rounded-md border border-[#1e293b] overflow-hidden">
            {(['en', 'nl'] as Language[]).map((l) => (
              <button
                key={l}
                id={`lang-${l}`}
                onClick={() => setLanguage(l)}
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  lang === l ? 'bg-[#3b82f6] text-white' : 'text-[#475569] hover:text-[#94a3b8]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button className="text-[#475569] hover:text-[#94a3b8] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      {activeTab === 'dashboard' ? (
        <>
          {/* 3-panel area */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left */}
            <div className="w-60 flex-shrink-0 overflow-hidden">
              <LeftPanel />
            </div>

            {/* Center: map + score cards stacked */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
              {/* Map — takes all remaining space */}
              <div className="flex-1 overflow-hidden min-h-0" style={{ minHeight: 300 }}>
                <MapPanel />
              </div>

              {/* Score cards */}
              {score ? (
                <div className="flex-shrink-0 bg-[#0d1117] border-t border-[#1e293b] px-3 py-2" style={{ height: 210 }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#64748b] mb-2">
                    {lang === 'nl' ? 'Score per laag' : 'Score per layer'}
                  </p>
                  <div style={{ height: 178 }}>
                    <ScoreCards layers={score.layers as Record<LayerKey, (typeof score.layers)[LayerKey]>} language={lang} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right */}
            <div className="w-64 flex-shrink-0 overflow-hidden">
              <RightPanel />
            </div>
          </div>

          {/* ── Footer: interpretatie + red flags ── */}
          {score && (
            <footer className="flex-shrink-0 bg-[#0d1117] border-t border-[#1e293b] px-4 py-2.5 flex items-start justify-between gap-4">
              {/* About */}
              <div className="hidden lg:block text-[8px] text-[#334155] max-w-44 leading-relaxed">
                {lang === 'nl'
                  ? 'De HDZ-score beoordeelt de locatie en het programma op vijf lagen die samen bepalen of een voorziening juridisch, ruimtelijk en maatschappelijk verdedigbaar is.'
                  : 'The HDZ score assesses location and programme across five layers to determine spatial, social, and legal defensibility.'}
              </div>

              {/* Interpretation legend */}
              <div className="flex-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#64748b] mb-1.5">
                  {lang === 'nl' ? 'Interpretatie' : 'Interpretation'}
                </p>
                <div className="flex gap-4 flex-wrap">
                  {INTERP.map((i) => (
                    <div key={i.range} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i.color }} />
                      <div>
                        <span className="text-[8px] font-bold text-white">{i.range} </span>
                        <span className="text-[8px] font-semibold" style={{ color: i.color }}>{lang === 'nl' ? i.labelNl : i.labelEn}</span>
                        <p className="text-[7px] text-[#475569]">{lang === 'nl' ? i.subNl : i.subEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red flags summary */}
              {score.redFlags.length > 0 && (
                <div className="flex-shrink-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#ef4444] mb-1.5">
                    Red Flags
                  </p>
                  <div className="space-y-0.5">
                    {score.redFlags.slice(0, 3).map((f) => (
                      <div key={f.id} className="flex items-start gap-1.5">
                        <span className="text-[8px] text-[#ef4444] flex-shrink-0">•</span>
                        <p className="text-[8px] text-[#fca5a5] leading-snug">{lang === 'nl' ? f.messageNl.split('—')[0] : f.messageEn.split('—')[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </footer>
          )}
        </>
      ) : (
        /* Placeholder for other tabs */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">{activeTab === 'rapport' ? '📄' : activeTab === 'vergelijken' ? '⚖️' : activeTab === 'scenarios' ? '🔀' : '🗺️'}</div>
            <p className="text-sm font-semibold text-white">{NAV_LABELS[activeTab][lang]}</p>
            <p className="text-xs text-[#475569]">{lang === 'nl' ? 'Binnenkort beschikbaar' : 'Coming soon'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <HDZProvider>
      <Dashboard />
    </HDZProvider>
  );
}
