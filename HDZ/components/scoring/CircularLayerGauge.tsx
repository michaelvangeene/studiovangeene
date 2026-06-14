'use client';

interface CircularLayerGaugeProps {
  score: number;
  max: number;
  color: string;
  icon: string;
  size?: number;
}

export default function CircularLayerGauge({
  score, max, color, icon, size = 80,
}: CircularLayerGaugeProps) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const dash = circ * pct;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 5px ${color}90)`, transition: 'stroke-dasharray 0.9s ease' }}
        />
      </svg>
      <span className="relative z-10 text-lg leading-none">{icon}</span>
    </div>
  );
}
