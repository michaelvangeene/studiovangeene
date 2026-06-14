'use client';

import type { Recommendation, RedFlag } from '@/types/hdz';

interface RedFlagListProps {
  redFlags: RedFlag[];
  recommendations: Recommendation[];
  language: 'en' | 'nl';
}

const t = {
  en: {
    redFlags: 'Red Flags',
    recommendations: 'Recommendations',
    noFlags: 'No critical issues detected.',
    noRecs: 'Score is strong — no major recommendations.',
    high: 'High Priority',
    medium: 'Medium',
    low: 'Low',
  },
  nl: {
    redFlags: 'Rode Vlaggen',
    recommendations: 'Aanbevelingen',
    noFlags: 'Geen kritieke problemen gedetecteerd.',
    noRecs: 'Score is sterk — geen grote aanbevelingen.',
    high: 'Hoge Prioriteit',
    medium: 'Gemiddeld',
    low: 'Laag',
  },
};

export default function RedFlagList({ redFlags, recommendations, language }: RedFlagListProps) {
  const lang = language;
  const tx = t[lang];

  return (
    <div className="space-y-3">
      {/* Red Flags */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#64748b] mb-2">
          {tx.redFlags}
        </h4>
        {redFlags.length === 0 ? (
          <p className="text-xs text-[#10b981] italic">{tx.noFlags}</p>
        ) : (
          <div className="space-y-1.5">
            {redFlags.map((flag) => (
              <div
                key={flag.id}
                className={`flex gap-2 items-start p-2 rounded-lg border ${
                  flag.severity === 'error'
                    ? 'bg-[#ef4444]/8 border-[#ef4444]/25'
                    : 'bg-[#f59e0b]/8 border-[#f59e0b]/25'
                }`}
              >
                <span className="text-xs mt-0.5 flex-shrink-0">
                  {flag.severity === 'error' ? '🔴' : '⚠️'}
                </span>
                <p className={`text-[10px] leading-relaxed ${
                  flag.severity === 'error' ? 'text-[#fca5a5]' : 'text-[#fde68a]'
                }`}>
                  {lang === 'nl' ? flag.messageNl : flag.messageEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#64748b] mb-2">
          {tx.recommendations}
        </h4>
        {recommendations.length === 0 ? (
          <p className="text-xs text-[#10b981] italic">{tx.noRecs}</p>
        ) : (
          <div className="space-y-1.5">
            {recommendations.map((rec) => {
              const priorityColor =
                rec.priority === 'high'
                  ? '#ef4444'
                  : rec.priority === 'medium'
                  ? '#f59e0b'
                  : '#3b82f6';
              return (
                <div
                  key={rec.id}
                  className="flex gap-2 items-start p-2 rounded-lg bg-white/3 border border-white/5"
                >
                  <div
                    className="w-1 flex-shrink-0 rounded-full mt-0.5 self-stretch"
                    style={{ background: priorityColor, minHeight: 14 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                      {lang === 'nl' ? rec.messageNl : rec.messageEn}
                    </p>
                    <span
                      className="text-[9px] font-semibold mt-0.5 block"
                      style={{ color: priorityColor }}
                    >
                      {tx[rec.priority]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
