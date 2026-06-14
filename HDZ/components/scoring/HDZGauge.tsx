'use client';

import { useEffect, useRef } from 'react';
import type { HDZCategory } from '@/types/hdz';

const CATEGORY_CONFIG: Record<
  HDZCategory,
  { color: string; glow: string; labelEn: string; labelNl: string; legalEn: string; legalNl: string }
> = {
  strong: {
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    labelEn: 'Strong',
    labelNl: 'Sterk',
    legalEn: 'Legally Defensible',
    legalNl: 'Juridisch Verdedigbaar',
  },
  moderate: {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    labelEn: 'Moderate',
    labelNl: 'Matig',
    legalEn: 'Conditionally Defensible',
    legalNl: 'Voorwaardelijk Verdedigbaar',
  },
  weak: {
    color: '#f97316',
    glow: 'rgba(249,115,22,0.35)',
    labelEn: 'Weak',
    labelNl: 'Zwak',
    legalEn: 'Requires Mitigation',
    legalNl: 'Vereist Mitigatie',
  },
  critical: {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
    labelEn: 'Critical',
    labelNl: 'Kritiek',
    legalEn: 'Not Defensible',
    legalNl: 'Niet Verdedigbaar',
  },
};

interface HDZGaugeProps {
  score: number;
  category: HDZCategory;
  legallyDefensible: boolean;
  language: 'en' | 'nl';
}

export default function HDZGauge({ score, category, legallyDefensible, language }: HDZGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = CATEGORY_CONFIG[category];
  const lang = language;

  // Draw animated gauge on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h * 0.58;
    const radius = w * 0.38;
    const startAngle = Math.PI * 0.75;
    const totalAngle = Math.PI * 1.5;

    let currentScore = 0;
    const targetScore = score;
    let animFrame: number;

    function draw(s: number) {
      ctx!.clearRect(0, 0, w, h);

      // Background track
      ctx!.beginPath();
      ctx!.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
      ctx!.strokeStyle = '#1e293b';
      ctx!.lineWidth = 14;
      ctx!.lineCap = 'round';
      ctx!.stroke();

      // Score arc
      const sweepAngle = (s / 100) * totalAngle;
      if (sweepAngle > 0) {
        const gradient = ctx!.createLinearGradient(cx - radius, cy, cx + radius, cy);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#10b981');

        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 14;
        ctx!.lineCap = 'round';
        ctx!.stroke();
      }

      // Glow effect on tip
      const tipAngle = startAngle + sweepAngle;
      const tipX = cx + radius * Math.cos(tipAngle);
      const tipY = cy + radius * Math.sin(tipAngle);
      const glowGrad = ctx!.createRadialGradient(tipX, tipY, 0, tipX, tipY, 16);
      glowGrad.addColorStop(0, cfg.color + 'cc');
      glowGrad.addColorStop(1, 'transparent');
      ctx!.beginPath();
      ctx!.arc(tipX, tipY, 16, 0, Math.PI * 2);
      ctx!.fillStyle = glowGrad;
      ctx!.fill();

      // Score text
      ctx!.font = `bold ${w * 0.18}px Inter, system-ui, sans-serif`;
      ctx!.fillStyle = '#ffffff';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(Math.round(s).toString(), cx, cy - radius * 0.05);

      // /100
      ctx!.font = `${w * 0.065}px Inter, system-ui, sans-serif`;
      ctx!.fillStyle = '#475569';
      ctx!.fillText('/100', cx, cy + radius * 0.22);
    }

    function animate() {
      currentScore += (targetScore - currentScore) * 0.08;
      if (Math.abs(targetScore - currentScore) < 0.1) currentScore = targetScore;
      draw(currentScore);
      if (currentScore !== targetScore) animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [score, cfg.color]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={220}
          height={140}
          className="block"
          style={{ filter: `drop-shadow(0 0 16px ${cfg.glow})` }}
        />
      </div>

      {/* Category badge */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
        style={{
          color: cfg.color,
          borderColor: cfg.color + '50',
          background: cfg.color + '15',
          boxShadow: `0 0 12px ${cfg.glow}`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: cfg.color }}
        />
        {lang === 'nl' ? cfg.labelNl : cfg.labelEn}
      </div>

      {/* Legal defensibility */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium border ${
          legallyDefensible
            ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10'
            : 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10'
        }`}
      >
        <span>{legallyDefensible ? '✓' : '✗'}</span>
        {lang === 'nl'
          ? legallyDefensible
            ? 'Juridisch Verdedigbaar'
            : 'Niet Juridisch Verdedigbaar'
          : legallyDefensible
          ? 'Legally Defensible'
          : 'Not Legally Defensible'}
      </div>
    </div>
  );
}
