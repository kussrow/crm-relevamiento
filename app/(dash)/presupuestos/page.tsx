import Link from "next/link";
import { Plus } from "lucide-react";
import { getPresupuestos, formatMoneda, PRESU_ESTADO_INFO } from "@/lib/presupuestos";
import { NegocioBadge } from "@/components/badges";
import { formatFecha } from "@/lib/scoring";
import type { Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PresupuestosPage() {
  const presupuestos = await getPresupuestos();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg">Presupuestos</h1>
          <p className="text-sm text-muted">{presupuestos.length} en total</p>
        </div>
        <Link
          href="/presupuestos/nuevo"
          className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo presupuesto
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-hover text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-faint">
                  Todavía no hay presupuestos. Creá el primero con “Nuevo presupuesto”.
                </td>
              </tr>
            )}
            {presupuestos.map((p) => {
              const est = PRESU_ESTADO_INFO[p.estado] ?? PRESU_ESTADO_INFO.borrador;
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-hover">
                  <td className="px-4 py-3">
                    <Link href={`/presupuestos/${p.id}`} className="font-medium text-fg">
                      {p.cliente || "Sin cliente"}
                    </Link>
                    <div className="text-xs text-faint">{p.telefono}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.negocio && <NegocioBadge value={p.negocio as Negocio} />}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${est.badge}`}
                    >
                      {est.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-fg">
                    {formatMoneda(p.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-faint">
                    {formatFecha(p.created_at)}
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
