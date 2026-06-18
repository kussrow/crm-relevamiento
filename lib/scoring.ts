import type { Temperatura, Estado, Negocio } from "./types";

// Estilo minimalista: solo un punto de color + texto neutro.
export const TEMP_INFO: Record<Temperatura, { label: string; dot: string }> = {
  caliente: { label: "Caliente", dot: "bg-red-500" },
  tibio: { label: "Tibio", dot: "bg-amber-400" },
  frio: { label: "Frío", dot: "bg-zinc-300" },
};

export const ESTADO_INFO: Record<Estado, { label: string; dot: string }> = {
  nuevo: { label: "Nuevo", dot: "bg-blue-500" },
  contactado: { label: "Contactado", dot: "bg-violet-500" },
  presupuesto: { label: "Presupuesto", dot: "bg-amber-500" },
  ganado: { label: "Ganado", dot: "bg-emerald-500" },
  perdido: { label: "Perdido", dot: "bg-zinc-400" },
};

export const NEGOCIO_INFO: Record<Negocio, { label: string; dot: string }> = {
  piscinas: { label: "Piscinas", dot: "bg-sky-500" },
  vivero: { label: "Vivero", dot: "bg-green-500" },
};

export function whatsappLink(telefono: string | null): string | null {
  if (!telefono) return null;
  const clean = telefono.replace(/\D/g, "");
  if (!clean) return null;
  return `https://wa.me/${clean}`;
}

export function formatFecha(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string | null): string {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}
