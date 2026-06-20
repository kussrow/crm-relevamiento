import Link from "next/link";
import { Search, Users } from "lucide-react";
import { getClientesConDatos } from "@/lib/leads";
import { getSesion } from "@/lib/auth";
import { NegocioBadge } from "@/components/badges";
import AccionesCliente from "@/components/AccionesCliente";
import NuevoCliente from "@/components/NuevoCliente";
import type { Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

function nombreCliente(l: {
  nombre: string | null;
  datos_personales: { nombre?: string; apellido?: string } | null;
}): string {
  const p = l.datos_personales;
  const completo = [p?.nombre, p?.apellido].filter(Boolean).join(" ").trim();
  return completo || l.nombre || "Sin nombre";
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sesion = await getSesion();
  const clientes = await getClientesConDatos(sp.q, sesion?.negocio);

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-fg">
            <Users className="h-5 w-5 text-accent" /> Clientes
          </h1>
          <p className="text-sm text-muted">
            {clientes.length} cliente{clientes.length === 1 ? "" : "s"} con datos cargados
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <form className="relative min-w-0 flex-1 sm:flex-none" action="/clientes">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              type="search"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Buscar por nombre, CUIT, teléfono…"
              className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-fg outline-none focus:border-accent sm:w-72"
            />
          </form>
          <NuevoCliente negocioFijo={sesion?.negocio ?? undefined} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border bg-hover text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Facturación</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-faint">
                  {sp.q
                    ? "No hay clientes que coincidan con la búsqueda."
                    : "Todavía no hay clientes con datos cargados. Cargá los datos personales o de facturación de un lead desde la bandeja."}
                </td>
              </tr>
            )}
            {clientes.map((c) => {
              const p = c.datos_personales;
              const f = c.datos_facturacion;
              const email = p?.email;
              const tel = p?.telefono || c.telefono;
              const loc = [p?.localidad || c.ciudad, p?.provincia || c.provincia]
                .filter(Boolean)
                .join(", ");
              return (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-hover"
                >
                  <td className="px-4 py-3">
                    <Link href={`/lead/${c.id}`} className="font-medium text-fg hover:text-accent">
                      {nombreCliente(c)}
                    </Link>
                    {p?.dni && <div className="text-xs text-faint">DNI {p.dni}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <NegocioBadge value={c.negocio as Negocio} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-fg">{tel || "—"}</div>
                    {email && <div className="text-xs text-faint">{email}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted">{loc || "—"}</td>
                  <td className="px-4 py-3">
                    {f?.razon_social || f?.cuit ? (
                      <>
                        <div className="text-fg">{f?.razon_social || "—"}</div>
                        <div className="text-xs text-faint">
                          {f?.cuit}
                          {f?.condicion_iva ? ` · ${f.condicion_iva}` : ""}
                        </div>
                      </>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <AccionesCliente id={c.id} nombre={nombreCliente(c)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
