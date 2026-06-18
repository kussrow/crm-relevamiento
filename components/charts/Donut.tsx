export interface Segment {
  label: string;
  value: number;
  className: string; // text-color (se usa como stroke vía currentColor)
}

export default function Donut({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((a, b) => a + b.value, 0);
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hover"
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {total > 0 &&
            segments.map((s, i) => {
              const len = (s.value / total) * c;
              const el = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  className={s.className}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-fg text-xl font-semibold"
        >
          {total}
        </text>
      </svg>

      <ul className="space-y-1.5 text-xs">
        {segments.filter((s) => s.value > 0).map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full bg-current ${s.className}`} />
            <span className="text-fg">{s.label}</span>
            <span className="text-faint">{s.value}</span>
          </li>
        ))}
        {total === 0 && <li className="text-faint">Sin datos</li>}
      </ul>
    </div>
  );
}
