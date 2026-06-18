"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { TEMP_INFO } from "@/lib/scoring";

const NEGOCIOS = [
  { value: "", label: "Todos" },
  { value: "piscinas", label: "Piscinas" },
  { value: "vivero", label: "Vivero" },
];

const TEMPS = [
  { value: "", label: "Todas", icon: null, color: "", badge: "" },
  { value: "caliente", ...TEMP_INFO.caliente },
  { value: "tibio", ...TEMP_INFO.tibio },
  { value: "frio", ...TEMP_INFO.frio },
];

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "presupuesto", label: "Presupuesto" },
  { value: "ganado", label: "Ganado" },
  { value: "perdido", label: "Perdido" },
];

export default function Filtros({ categorias }: { categorias: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/bandeja?${params.toString()}`);
    },
    [router, sp]
  );

  const get = (k: string) => sp.get(k) ?? "";

  const chip = (active: boolean) =>
    `rounded-md border px-3 py-1 text-sm transition-colors ${
      active
        ? "border-accent bg-accent text-accent-fg"
        : "border-border bg-card text-muted hover:bg-hover"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1.5">
        {NEGOCIOS.map((n) => (
          <button
            key={n.value}
            onClick={() => setParam("negocio", n.value)}
            className={chip(get("negocio") === n.value)}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5">
        {TEMPS.map((t) => {
          const active = get("temperatura") === t.value;
          const Icon = t.icon;
          const cls = active
            ? t.value
              ? `${t.badge} border border-transparent`
              : "border border-accent bg-accent text-accent-fg"
            : "border border-border bg-card text-muted hover:bg-hover";
          return (
            <button
              key={t.value}
              onClick={() => setParam("temperatura", t.value)}
              className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm transition-colors ${cls}`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${active ? "" : t.color}`} />}
              {t.label}
            </button>
          );
        })}
      </div>

      <select
        value={get("estado")}
        onChange={(e) => setParam("estado", e.target.value)}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-fg"
      >
        {ESTADOS.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>

      <select
        value={get("categoria")}
        onChange={(e) => setParam("categoria", e.target.value)}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-fg"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        type="search"
        defaultValue={get("q")}
        placeholder="Buscar nombre, teléfono o mensaje…"
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
        }}
        className="min-w-56 flex-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-fg"
      />
    </div>
  );
}
