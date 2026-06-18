export default function AreaChart({
  points,
}: {
  points: { label: string; value: number }[];
}) {
  const w = 600;
  const h = 150;
  const pad = 10;
  const n = points.length;
  const max = Math.max(1, ...points.map((p) => p.value));

  if (n === 0) {
    return <p className="text-sm text-faint">Sin datos.</p>;
  }

  const x = (i: number) => (n <= 1 ? w / 2 : pad + (i / (n - 1)) * (w - 2 * pad));
  const y = (v: number) => h - pad - (v / max) * (h - 2 * pad);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${h - pad} L${x(0).toFixed(1)},${h - pad} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 150 }}>
        <path d={area} className="fill-fg/[0.06]" />
        <path d={line} className="stroke-fg" fill="none" strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={2.5} className="fill-fg" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-faint">
        <span>{points[0]?.label.slice(5)}</span>
        {points.length > 2 && (
          <span>{points[Math.floor(n / 2)]?.label.slice(5)}</span>
        )}
        <span>{points[n - 1]?.label.slice(5)}</span>
      </div>
    </div>
  );
}
