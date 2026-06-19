"use client";

import { useRouter } from "next/navigation";
import { UserSearch } from "lucide-react";
import type { LeadOpcion } from "@/lib/leads";

function nombreDe(l: LeadOpcion): string {
  const p = l.datos_personales;
  const completo = [p?.nombre, p?.apellido].filter(Boolean).join(" ").trim();
  return completo || l.nombre || "Sin nombre";
}

function telefonoDe(l: LeadOpcion): string {
  return l.datos_personales?.telefono || l.telefono || "";
}

export default function SelectorLeadPresupuesto({
  leads,
  selectedId,
}: {
  leads: LeadOpcion[];
  selectedId?: number;
}) {
  const router = useRouter();

  const elegir = (value: string) => {
    if (!value) {
      router.push("/presupuestos/nuevo");
      return;
    }
    const l = leads.find((x) => String(x.id) === value);
    if (!l) return;
    const params = new URLSearchParams({
      lead: String(l.id),
      cliente: nombreDe(l),
      telefono: telefonoDe(l),
      negocio: l.negocio,
    });
    router.push(`/presupuestos/nuevo?${params.toString()}`);
  };

  return (
    <section className="mb-4 rounded-lg border border-border bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
        <UserSearch className="h-4 w-4 text-muted" /> Traer datos de un lead
      </h2>
      {leads.length === 0 ? (
        <p className="text-sm text-faint">
          Todavía no hay leads con datos cargados. Cargá los datos personales o de
          facturación de un lead desde la bandeja para poder traerlos acá.
        </p>
      ) : (
        <select
          value={selectedId ? String(selectedId) : ""}
          onChange={(e) => elegir(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-fg outline-none focus:border-muted"
        >
          <option value="">— Elegí un lead completado —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {nombreDe(l)}
              {telefonoDe(l) ? ` · ${telefonoDe(l)}` : ""} · {l.negocio}
            </option>
          ))}
        </select>
      )}
    </section>
  );
}
