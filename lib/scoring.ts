import { Flame, Thermometer, Snowflake, type LucideIcon } from "lucide-react";
import type {
  Temperatura,
  Estado,
  Negocio,
  TipoEvento,
  EstadoPresupuesto,
} from "./types";

// Temperatura: color + icono monocromático + pill tintada.
export const TEMP_INFO: Record<
  Temperatura,
  { label: string; icon: LucideIcon; color: string; badge: string; dot: string; chart: string }
> = {
  caliente: {
    label: "Caliente",
    icon: Flame,
    color: "text-red-500",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    chart: "text-red-500",
  },
  tibio: {
    label: "Tibio",
    icon: Thermometer,
    color: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
    chart: "text-amber-400",
  },
  frio: {
    label: "Frío",
    icon: Snowflake,
    color: "text-sky-500",
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dot: "bg-sky-400",
    chart: "text-sky-400",
  },
};

// Estado: pill con un poco de color.
export const ESTADO_INFO: Record<
  Estado,
  { label: string; badge: string; dot: string; chart: string }
> = {
  nuevo: { label: "Nuevo", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400", dot: "bg-blue-500", chart: "text-blue-500" },
  contactado: { label: "Contactado", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400", dot: "bg-violet-500", chart: "text-violet-500" },
  presupuesto: { label: "Presupuesto", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400", dot: "bg-amber-500", chart: "text-amber-500" },
  ganado: { label: "Ganado", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", chart: "text-emerald-500" },
  perdido: { label: "Perdido", badge: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400", dot: "bg-zinc-400", chart: "text-zinc-400" },
};

export const NEGOCIO_INFO: Record<Negocio, { label: string; dot: string; chart: string }> = {
  piscinas: { label: "Piscinas", dot: "bg-sky-500", chart: "text-sky-500" },
  vivero: { label: "Vivero", dot: "bg-green-500", chart: "text-green-500" },
};

// Tipos de evento de la agenda: color por tipo.
export const EVENTO_INFO: Record<
  TipoEvento,
  { label: string; dot: string; badge: string; text: string }
> = {
  visita: {
    label: "Visita",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  reunion: {
    label: "Reunión",
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    text: "text-violet-600 dark:text-violet-400",
  },
  llamada: {
    label: "Llamada",
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
  },
  seguimiento: {
    label: "Seguimiento",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  otro: {
    label: "Otro",
    dot: "bg-zinc-400",
    badge: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
  },
};

// Estado de presupuesto: etiqueta + pill (client-safe, sin acceso a DB).
export const PRESU_ESTADO_INFO: Record<
  EstadoPresupuesto,
  { label: string; badge: string }
> = {
  borrador: { label: "Borrador", badge: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400" },
  enviado: { label: "Enviado", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  aceptado: { label: "Aceptado", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rechazado: { label: "Rechazado", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
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
