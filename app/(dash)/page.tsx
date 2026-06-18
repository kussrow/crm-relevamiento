import Link from "next/link";
import { getMetrics, getPrioritarios } from "@/lib/leads";
import { TEMP_INFO, ESTADO_INFO, NEGOCIO_INFO, timeAgo } from "@/lib/scoring";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import type { Temperatura, Estado, Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-zinc-900">{value}</div>
      {hint && <div className="text-xs text-zinc-400">{hint}</div>}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: React.ReactNode;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-32 shrink-0 truncate text-zinc-600">{label}</div>
      <div className="h-5 flex-1 overflow-hidden rounded bg-zinc-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 shrink-0 text-right font-medium text-zinc-700">{value}</div>
    </div>
  );
}

export default async function TableroPage() {
  const [m, prioritarios] = await Promise.all([getMetrics(), getPrioritarios()]);
  const maxDia = Math.max(1, ...m.porDia.map((d) => d.total));
  const maxCat = Math.max(1, ...m.porCategoria.map((c) => c.total));
  const tempTotal = m.porTemperatura.reduce((a, b) => a + b.total, 0) || 1;

  const estadoOrder: Estado[] = ["nuevo", "contactado", "presupuesto", "ganado", "perdido"];
  const estadoMap = Object.fromEntries(m.porEstado.map((e) => [e.estado, e.total]));

  return (
    <div className="p-6">
      <h1 className="mb-5 text-xl font-semibold text-zinc-900">Tablero</h1>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Consultas totales" value={m.total} />
        <Kpi
          label="Requieren humano"
          value={m.requiereHumano}
          hint={`${Math.round((m.requiereHumano / (m.total || 1)) * 100)}% del total`}
        />
        {m.porNegocio.map((n) => (
          <Kpi
            key={n.negocio}
            label={NEGOCIO_INFO[n.negocio as Negocio]?.label ?? n.negocio}
            value={n.total}
          />
        ))}
      </div>

      {/* Para atender ahora */}
      <section className="mb-5 rounded-lg border border-zinc-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-800">Para atender ahora</h2>
          <Link href="/bandeja" className="text-xs text-zinc-400 hover:text-zinc-700">
            Ver toda la bandeja →
          </Link>
        </div>
        {prioritarios.length === 0 ? (
          <p className="text-sm text-zinc-400">No hay leads prioritarios pendientes. 🎉</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {prioritarios.map((lead) => (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className="rounded-lg border border-zinc-100 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="mb-1 flex items-center gap-2">
                  <TemperaturaBadge value={lead.temperatura} />
                  <NegocioBadge value={lead.negocio} />
                  {lead.requiere_humano && (
                    <span className="text-[10px] font-medium text-red-500">requiere atención</span>
                  )}
                </div>
                <div className="text-sm font-medium text-zinc-800">
                  {lead.nombre || "Sin nombre"}
                </div>
                <div className="line-clamp-1 text-xs text-zinc-500">
                  {lead.resumen || lead.mensaje}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  {lead.categoria} · {timeAgo(lead.fecha_mensaje)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperatura */}
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Calificación de leads</h2>
          <div className="space-y-2">
            {(["caliente", "tibio", "frio"] as Temperatura[]).map((t) => {
              const val = m.porTemperatura.find((x) => x.temperatura === t)?.total ?? 0;
              return (
                <BarRow
                  key={t}
                  label={
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${TEMP_INFO[t].dot}`} />
                      {TEMP_INFO[t].label}
                    </span>
                  }
                  value={val}
                  max={tempTotal}
                  color={
                    t === "caliente"
                      ? "bg-red-400"
                      : t === "tibio"
                      ? "bg-amber-400"
                      : "bg-sky-400"
                  }
                />
              );
            })}
          </div>
        </section>

        {/* Pipeline */}
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Pipeline (estados)</h2>
          <div className="space-y-2">
            {estadoOrder.map((e) => (
              <BarRow
                key={e}
                label={ESTADO_INFO[e].label}
                value={estadoMap[e] ?? 0}
                max={m.total || 1}
                color={ESTADO_INFO[e].dot}
              />
            ))}
          </div>
        </section>

        {/* Top categorías */}
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Top categorías</h2>
          <div className="space-y-2">
            {m.porCategoria.map((c) => (
              <BarRow
                key={c.categoria}
                label={c.categoria}
                value={c.total}
                max={maxCat}
                color="bg-zinc-700"
              />
            ))}
            {m.porCategoria.length === 0 && (
              <p className="text-sm text-zinc-400">Sin datos.</p>
            )}
          </div>
        </section>

        {/* Por día */}
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700">Consultas por día</h2>
          <div className="flex h-40 items-end gap-1.5">
            {m.porDia.map((d) => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-zinc-800"
                  style={{ height: `${Math.round((d.total / maxDia) * 100)}%` }}
                  title={`${d.dia}: ${d.total}`}
                />
                <span className="text-[10px] text-zinc-400">{d.dia.slice(8, 10)}</span>
              </div>
            ))}
            {m.porDia.length === 0 && (
              <p className="text-sm text-zinc-400">Sin datos.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
