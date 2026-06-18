import Link from "next/link";
import { getLeads, getCategorias, type LeadFilters } from "@/lib/leads";
import Filtros from "@/components/Filtros";
import { TemperaturaBadge, EstadoBadge, NegocioBadge } from "@/components/badges";
import BotonEliminar from "@/components/BotonEliminar";
import { timeAgo } from "@/lib/scoring";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BandejaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: LeadFilters = {
    negocio: sp.negocio,
    estado: sp.estado,
    temperatura: sp.temperatura,
    categoria: sp.categoria,
    q: sp.q,
  };

  const [leads, categorias] = await Promise.all([
    getLeads(filters),
    getCategorias(sp.negocio),
  ]);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-fg">Bandeja de consultas</h1>
        <p className="text-sm text-muted">
          {leads.length} consulta{leads.length === 1 ? "" : "s"} · ordenadas por prioridad
        </p>
      </div>

      <div className="mb-4">
        <Filtros categorias={categorias} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-hover text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Consulta</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Fecha</th>
              <th className="px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-faint">
                  No hay consultas que coincidan con los filtros.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="group border-b border-border last:border-0 hover:bg-hover"
              >
                <td className="px-4 py-3">
                  <Link href={`/lead/${lead.id}`} className="flex items-center gap-2">
                    <TemperaturaBadge value={lead.temperatura} />
                    {lead.requiere_humano && (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-red-500"
                        aria-label="Requiere atención"
                      />
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <NegocioBadge value={lead.negocio} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/lead/${lead.id}`} className="block">
                    <div className="font-medium text-fg">
                      {lead.nombre || "Sin nombre"}
                    </div>
                    <div className="text-xs text-faint">{lead.telefono}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{lead.categoria || "—"}</td>
                <td className="max-w-xs px-4 py-3">
                  <Link href={`/lead/${lead.id}`} className="block">
                    <span className="line-clamp-2 text-muted">
                      {lead.resumen || lead.mensaje}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge value={lead.estado} />
                </td>
                <td className="px-4 py-3 text-right text-xs text-faint">
                  {timeAgo(lead.fecha_mensaje)}
                </td>
                <td className="px-2 py-3 text-right">
                  <BotonEliminar id={lead.id} variant="compact" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
