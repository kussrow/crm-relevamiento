import Link from "next/link";
import { getClientes, getCategorias, type LeadFilters } from "@/lib/leads";
import { getSesion } from "@/lib/auth";
import Filtros from "@/components/Filtros";
import VistaSwitcher from "@/components/VistaSwitcher";
import BandejaKanban from "@/components/BandejaKanban";
import { TemperaturaBadge, EstadoBadge, NegocioBadge } from "@/components/badges";
import BotonEliminar from "@/components/BotonEliminar";
import { timeAgo } from "@/lib/scoring";
import { AlertTriangle, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sesion = await getSesion();
  // Usuario restringido: se fuerza su rubro e ignora el filtro de la URL.
  const negocio = sesion?.negocio ?? sp.negocio;
  const filters: LeadFilters = {
    negocio,
    estado: sp.estado,
    temperatura: sp.temperatura,
    categoria: sp.categoria,
    q: sp.q,
  };
  const vista = sp.vista === "kanban" ? "kanban" : "lista";

  const [clientes, categorias] = await Promise.all([
    getClientes(filters),
    getCategorias(negocio),
  ]);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-fg">
            <Inbox className="h-5 w-5 text-accent" /> Bandeja de clientes
          </h1>
          <p className="text-sm text-muted">
            {clientes.length} cliente{clientes.length === 1 ? "" : "s"} ·{" "}
            {vista === "kanban" ? "tablero por estado" : "ordenados por prioridad"}
          </p>
        </div>
        <VistaSwitcher />
      </div>

      <div className="mb-4">
        <Filtros categorias={categorias} mostrarNegocio={!sesion?.negocio} />
      </div>

      {vista === "kanban" ? (
        <BandejaKanban clientes={clientes} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-hover text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Negocio</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Última consulta</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Fecha</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-faint">
                    No hay clientes que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {clientes.map((c) => (
                <tr
                  key={c.ckey}
                  className="group border-b border-border last:border-0 hover:bg-hover"
                >
                  <td className="px-4 py-3">
                    <Link href={`/lead/${c.id}`} className="flex items-center gap-2">
                      <TemperaturaBadge value={c.temperatura} />
                      {c.any_humano && (
                        <AlertTriangle
                          className="h-3.5 w-3.5 text-red-500"
                          aria-label="Requiere atención"
                        />
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <NegocioBadge value={c.negocio} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/lead/${c.id}`} className="block">
                      <div className="flex items-center gap-2 font-medium text-fg">
                        {c.nombre || "Sin nombre"}
                        {c.consultas > 1 && (
                          <span className="rounded-full bg-hover px-1.5 py-0.5 text-xs font-normal text-muted">
                            {c.consultas} consultas
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-faint">{c.telefono}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.categoria || "—"}</td>
                  <td className="max-w-xs px-4 py-3">
                    <Link href={`/lead/${c.id}`} className="block">
                      <span className="line-clamp-2 text-muted">
                        {c.resumen || c.mensaje}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge value={c.estado} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-faint">
                    {timeAgo(c.fecha_mensaje)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <BotonEliminar id={c.id} variant="compact" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
