import Link from "next/link";
import { getMetrics, getPrioritarios } from "@/lib/leads";
import { TEMP_INFO, ESTADO_INFO, NEGOCIO_INFO, timeAgo } from "@/lib/scoring";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import type { Temperatura, Estado, Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="text-xs text-slate-400">{hint}</div>}
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
      <div className="w-32 shrink-0 truncate text-slate-600">{label}</div>
      <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 shrink-0 text-right font-medium text-slate-700">{value}</div>
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
      <h1 className="mb-5 text-xl font-semibold text-slate-900">Tablero</h1>

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
            label={`${NEGOCIO_INFO[n.negocio as Negocio]?.emoji ?? ""} ${
              NEGOCIO_INFO[n.negocio as Negocio]?.label ?? n.negocio
            }`}
            value={n.total}
          />
        ))}
      </div>

      {/* Para atender ahora */}
      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">🔥 Para atender ahora</h2>
          <Link href="/bandeja" className="text-xs text-slate-400 hover:text-slate-700">
            Ver toda la bandeja →
          </Link>
        </div>
        {prioritarios.length === 0 ? (
          <p className="text-sm text-slate-400">No hay leads prioritarios pendientes. 🎉</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {prioritarios.map((lead) => (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className="rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <TemperaturaBadge value={lead.temperatura} />
                  <NegocioBadge value={lead.negocio} />
                  {lead.requiere_humano && <span title="Requiere humano">⚠️</span>}
                </div>
                <div className="text-sm font-medium text-slate-800">
                  {lead.nombre || "Sin nombre"}
                </div>
                <div className="line-clamp-1 text-xs text-slate-500">
                  {lead.resumen || lead.mensaje}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {lead.categoria} · {timeAgo(lead.fecha_mensaje)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperatura */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Calificación de leads</h2>
          <div className="space-y-2">
            {(["caliente", "tibio", "frio"] as Temperatura[]).map((t) => {
              const val = m.porTemperatura.find((x) => x.temperatura === t)?.total ?? 0;
              return (
                <BarRow
                  key={t}
                  label={
                    <span>
                      {TEMP_INFO[t].emoji} {TEMP_INFO[t].label}
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
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Pipeline (estados)</h2>
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
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Top categorías</h2>
          <div className="space-y-2">
            {m.porCategoria.map((c) => (
              <BarRow
                key={c.categoria}
                label={c.categoria}
                value={c.total}
                max={maxCat}
                color="bg-slate-700"
              />
            ))}
            {m.porCategoria.length === 0 && (
              <p className="text-sm text-slate-400">Sin datos.</p>
            )}
          </div>
        </section>

        {/* Por día */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Consultas por día</h2>
          <div className="flex h-40 items-end gap-1.5">
            {m.porDia.map((d) => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-slate-800"
                  style={{ height: `${Math.round((d.total / maxDia) * 100)}%` }}
                  title={`${d.dia}: ${d.total}`}
                />
                <span className="text-[10px] text-slate-400">{d.dia.slice(8, 10)}</span>
              </div>
            ))}
            {m.porDia.length === 0 && (
              <p className="text-sm text-slate-400">Sin datos.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
