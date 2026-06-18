import { TEMP_INFO, ESTADO_INFO, NEGOCIO_INFO } from "@/lib/scoring";
import type { Temperatura, Estado, Negocio } from "@/lib/types";

const pill =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium";

export function TemperaturaBadge({ value }: { value: Temperatura }) {
  const t = TEMP_INFO[value] ?? TEMP_INFO.frio;
  const Icon = t.icon;
  return (
    <span className={`${pill} ${t.badge}`}>
      <Icon className="h-3 w-3" />
      {t.label}
    </span>
  );
}

export function EstadoBadge({ value }: { value: Estado }) {
  const e = ESTADO_INFO[value] ?? ESTADO_INFO.nuevo;
  return <span className={`${pill} ${e.badge}`}>{e.label}</span>;
}

export function NegocioBadge({ value }: { value: Negocio }) {
  const n = NEGOCIO_INFO[value] ?? { label: value, dot: "bg-faint" };
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${n.dot}`} />
      {n.label}
    </span>
  );
}
