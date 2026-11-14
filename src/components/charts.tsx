import { useId } from 'react';

export function Donut({
  parts,
  total,
  size = 132,
}: {
  parts: { label: string; value: number; color: string }[];
  total: number;
  size?: number;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`Emissions by source: ${parts.map((p) => `${p.label} ${total ? Math.round((p.value / total) * 100) : 0}%`).join(', ')}`}
      className="shrink-0 drop-shadow-[0_10px_14px_rgba(46,84,170,0.22)]"
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="#dfe8fb" strokeWidth="17" />
      {parts.map((p) => {
        const len = total ? (p.value / total) * c : 0;
        const el = (
          <circle
            key={p.label}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth="17"
            strokeDasharray={`${Math.max(len - 1.6, 0)} ${c}`}
            strokeDashoffset={-off}
            transform="rotate(-90 60 60)"
          />
        );
        off += len;
        return el;
      })}
      <circle cx="60" cy="60" r="34" fill="#fff" />
    </svg>
  );
}

export interface Series {
  name: string;
  values: number[];
  color: string;
  dashed?: boolean;
  area?: boolean;
  dots?: boolean;
}

export function LineChart({ labels, series, height = 136 }: { labels: string[]; series: Series[]; height?: number }) {
  const id = useId();
  const W = 320;
  const H = height;
  const pl = 30;
  const pr = 10;
  const pt = 12;
  const pb = 22;
  const n = labels.length;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 0);
  const min = Math.min(...all);
  const pad = (max - min) * 0.35 || max * 0.12 || 1;
  const lo = Math.max(0, min - pad);
  const hi = max + pad * 0.6;
  const x = (i: number) => pl + (n > 1 ? (i * (W - pl - pr)) / (n - 1) : 0);
  const y = (v: number) => pt + (1 - (v - lo) / (hi - lo || 1)) * (H - pt - pb);
  const path = (vals: number[]) =>
    vals
      .map((v, i) => {
        if (i === 0) return `M${x(0)} ${y(v)}`;
        const mx = (x(i - 1) + x(i)) / 2;
        return `C${mx} ${y(vals[i - 1])} ${mx} ${y(v)} ${x(i)} ${y(v)}`;
      })
      .join(' ');
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={series.map((s) => `${s.name}: ${s.values.map((v) => v.toFixed(1)).join(', ')}`).join('. ')}
    >
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb6d8" stopOpacity="0.38" />
          <stop offset="1" stopColor="#2e6bf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#d9e3f8" strokeWidth="1" strokeDasharray="2 4" />
          <text x={pl - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#66759b">
            {t.toFixed(t >= 100 ? 0 : 1)}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={H - 5} textAnchor="middle" fontSize="9" fontWeight="600" fill="#66759b">
          {l}
        </text>
      ))}
      {series.map((s) => (
        <g key={s.name}>
          {s.area && <path d={`${path(s.values)} L${x(n - 1)} ${H - pb} L${x(0)} ${H - pb} Z`} fill={`url(#${id}a)`} />}
          <path
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.dashed ? 1.6 : 2.4}
            strokeDasharray={s.dashed ? '4 4' : undefined}
            strokeLinecap="round"
          />
          {s.dots &&
            s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill="#fff" stroke={s.color} strokeWidth="2" />
            ))}
        </g>
      ))}
    </svg>
  );
}
