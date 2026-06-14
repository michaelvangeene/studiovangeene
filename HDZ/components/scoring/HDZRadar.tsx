'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { LayerKey, LayerScore } from '@/types/hdz';

interface HDZRadarProps {
  layers: Record<LayerKey, LayerScore>;
  language: 'en' | 'nl';
}

export default function HDZRadar({ layers, language }: HDZRadarProps) {
  const data = (Object.keys(layers) as LayerKey[]).map((key) => {
    const layer = layers[key];
    return {
      subject: language === 'nl' ? layer.labelNl : layer.labelEn,
      score: layer.score,
      max: layer.max,
      pct: Math.round((layer.score / layer.max) * 100),
    };
  });

  return (
    <div className="w-full" style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }}
          />
          <Radar
            name="Score"
            dataKey="pct"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: 8,
              fontSize: 11,
              color: '#fff',
            }}
            formatter={(value) => [`${value}%`, language === 'nl' ? 'Score' : 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
