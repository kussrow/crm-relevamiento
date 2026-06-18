import { TEMP_INFO, ESTADO_INFO, NEGOCIO_INFO } from "@/lib/scoring";
import type { Temperatura, Estado, Negocio } from "@/lib/types";

const base =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function TemperaturaBadge({ value }: { value: Temperatura }) {
  const t = TEMP_INFO[value] ?? TEMP_INFO.frio;
  return (
    <span className={`${base} ${t.className}`}>
      <span>{t.emoji}</span>
      {t.label}
    </span>
  );
}

export function EstadoBadge({ value }: { value: Estado }) {
  const e = ESTADO_INFO[value] ?? ESTADO_INFO.nuevo;
  return (
    <span className={`${base} ${e.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${e.dot}`} />
      {e.label}
    </span>
  );
}

export function NegocioBadge({ value }: { value: Negocio }) {
  const n = NEGOCIO_INFO[value] ?? {
    label: value,
    emoji: "•",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span className={`${base} ${n.className}`}>
      <span>{n.emoji}</span>
      {n.label}
    </span>
  );
}
