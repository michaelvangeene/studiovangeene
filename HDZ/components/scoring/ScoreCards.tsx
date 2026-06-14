'use client';

import { useState } from 'react';
import type { LayerKey, LayerScore } from '@/types/hdz';
import CircularLayerGauge from './CircularLayerGauge';

const LAYER_CFG: Record<LayerKey, { color: string; icon: string; num: number; subtitleEn: string; subtitleNl: string }> = {
  basicNeeds:  { color: '#10b981', icon: '🏥', num: 1, subtitleEn: 'Access & existence', subtitleNl: 'Toegang & bestaan' },
  spatialFit:  { color: '#3b82f6', icon: '📐', num: 2, subtitleEn: 'Urban integration', subtitleNl: 'Inpassing in stad' },
  impact:      { color: '#f97316', icon: '⚡', num: 3, subtitleEn: 'Effect on surroundings', subtitleNl: 'Effect op omgeving' },
  governance:  { color: '#8b5cf6', icon: '🏛', num: 4, subtitleEn: 'Management & control', subtitleNl: 'Beheer & controle' },
  policyFit:   { color: '#06b6d4', icon: '📋', num: 5, subtitleEn: 'Policy alignment', subtitleNl: 'Beleidsmatige aansluiting' },
};

function dotColor(score: number, max: number) {
  const p = score / max;
  return p >= 0.7 ? '#10b981' : p >= 0.45 ? '#f59e0b' : '#ef4444';
}

interface ScoreCardsProps {
  layers: Record<LayerKey, LayerScore>;
  language: 'en' | 'nl';
}

export default function ScoreCards({ layers, language }: ScoreCardsProps) {
  const [expanded, setExpanded] = useState<LayerKey | null>(null);
  const nl = language === 'nl';

  return (
    <div className="flex gap-2 h-full">
      {(Object.keys(LAYER_CFG) as LayerKey[]).map((key) => {
        const layer = layers[key];
        const cfg = LAYER_CFG[key];
        const isOpen = expanded === key;

        return (
          <div
            key={key}
            onClick={() => setExpanded(isOpen ? null : key)}
            className="flex-1 flex flex-col bg-[#111827] rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden"
            style={{ borderColor: isOpen ? cfg.color + '70' : '#1e293b', boxShadow: isOpen ? `0 0 16px ${cfg.color}20` : 'none' }}
          >
            {/* Top colour strip */}
            <div className="h-0.5 rounded-t-xl" style={{ background: cfg.color }} />

            <div className="flex flex-col items-center px-2 pt-2 pb-1 flex-1">
              {/* Header */}
              <div className="w-full mb-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
                  {cfg.num}. {nl ? layer.labelNl : layer.labelEn}
                </p>
                <p className="text-[8px] text-[#475569]">{nl ? cfg.subtitleNl : cfg.subtitleEn}</p>
              </div>

              {/* Circular gauge */}
              <CircularLayerGauge score={layer.score} max={layer.max} color={cfg.color} icon={cfg.icon} size={72} />

              {/* Score */}
              <div className="mt-1 text-center">
                <span className="text-base font-black" style={{ color: cfg.color }}>{layer.score}</span>
                <span className="text-[10px] text-[#475569]"> / {layer.max}</span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#1e293b] my-1.5" />

              {/* Sub-scores */}
              <div className="w-full space-y-0.5 flex-1">
                {layer.subScores.map((sub) => (
                  <div key={sub.key} className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor(sub.score, sub.max) }} />
                      <span className="text-[8px] text-[#64748b] truncate">{nl ? sub.labelNl : sub.labelEn}</span>
                    </div>
                    <span className="text-[8px] font-semibold flex-shrink-0" style={{ color: dotColor(sub.score, sub.max) }}>
                      {sub.score}/{sub.max}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom total */}
              <div className="w-full mt-1 pt-1 border-t border-[#1e293b] text-center">
                <span className="text-xs font-black" style={{ color: cfg.color }}>{layer.score}</span>
                <span className="text-[9px] text-[#475569]"> / {layer.max}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
