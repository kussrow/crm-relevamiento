import { TEMP_INFO, ESTADO_INFO, NEGOCIO_INFO } from "@/lib/scoring";
import type { Temperatura, Estado, Negocio } from "@/lib/types";

const base =
  "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-zinc-600";

function Dot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}

export function TemperaturaBadge({ value }: { value: Temperatura }) {
  const t = TEMP_INFO[value] ?? TEMP_INFO.frio;
  return (
    <span className={base}>
      <Dot className={t.dot} />
      {t.label}
    </span>
  );
}

export function EstadoBadge({ value }: { value: Estado }) {
  const e = ESTADO_INFO[value] ?? ESTADO_INFO.nuevo;
  return (
    <span className={base}>
      <Dot className={e.dot} />
      {e.label}
    </span>
  );
}

export function NegocioBadge({ value }: { value: Negocio }) {
  const n = NEGOCIO_INFO[value] ?? { label: value, dot: "bg-zinc-300" };
  return (
    <span className={base}>
      <Dot className={n.dot} />
      {n.label}
    </span>
  );
}
