import type { Temperatura, Estado, Negocio } from "./types";

// --- Temperatura (calificación del lead) ---
export const TEMP_INFO: Record<
  Temperatura,
  { label: string; emoji: string; className: string }
> = {
  caliente: {
    label: "Caliente",
    emoji: "🔥",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  tibio: {
    label: "Tibio",
    emoji: "🌤️",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  frio: {
    label: "Frío",
    emoji: "❄️",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
};

// --- Estados del pipeline ---
export const ESTADO_INFO: Record<
  Estado,
  { label: string; className: string; dot: string }
> = {
  nuevo: {
    label: "Nuevo",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  contactado: {
    label: "Contactado",
    className: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  presupuesto: {
    label: "Presupuesto",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  ganado: {
    label: "Ganado",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  perdido: {
    label: "Perdido",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

// --- Negocios ---
export const NEGOCIO_INFO: Record<
  Negocio,
  { label: string; emoji: string; className: string }
> = {
  piscinas: {
    label: "Piscinas",
    emoji: "🏊",
    className: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  vivero: {
    label: "Vivero",
    emoji: "🌿",
    className: "bg-green-100 text-green-700 border-green-200",
  },
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
