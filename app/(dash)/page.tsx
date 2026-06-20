import Link from "next/link";
import { MessageSquare, TriangleAlert, Waves, Sprout, LayoutDashboard, type LucideIcon } from "lucide-react";
import { getMetrics, getPrioritarios } from "@/lib/leads";
import { getSesion } from "@/lib/auth";
import { ESTADO_INFO, TEMP_INFO, NEGOCIO_INFO, timeAgo } from "@/lib/scoring";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import Donut from "@/components/charts/Donut";
import AreaChart from "@/components/charts/AreaChart";
import type { Estado, Temperatura, Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEGOCIO_ICON: Record<string, LucideIcon> = {
  piscinas: Waves,
  vivero: Sprout,
};

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  color = "text-fg",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
      {Icon && (
        <div className={`rounded-lg bg-hover p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-faint">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-fg">{value}</div>
        {hint && <div className="text-xs text-faint">{hint}</div>}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const sesion = await getSesion();
  const neg = sesion?.negocio ?? undefined;
  const [m, prioritarios] = await Promise.all([getMetrics(neg), getPrioritarios(neg)]);
  const maxCat = Math.max(1, ...m.porCategoria.map((c) => c.total));

  const estadoOrder: Estado[] = ["nuevo", "contactado", "presupuesto", "ganado", "perdido"];
  const estadoMap = Object.fromEntries(m.porEstado.map((e) => [e.estado, e.total]));
  const tempMap = Object.fromEntries(m.porTemperatura.map((t) => [t.temperatura, t.total]));
  const negMap = Object.fromEntries(m.porNegocio.map((nn) => [nn.negocio, nn.total]));

  const estadoSeg = estadoOrder.map((e) => ({
    label: ESTADO_INFO[e].label,
    value: estadoMap[e] ?? 0,
    className: ESTADO_INFO[e].chart,
  }));
  const tempSeg = (["caliente", "tibio", "frio"] as Temperatura[]).map((t) => ({
    label: TEMP_INFO[t].label,
    value: tempMap[t] ?? 0,
    className: TEMP_INFO[t].chart,
  }));
  const negSeg = (["piscinas", "vivero"] as Negocio[]).map((nn) => ({
    label: NEGOCIO_INFO[nn].label,
    value: negMap[nn] ?? 0,
    className: NEGOCIO_INFO[nn].chart,
  }));

  return (
    <div className="p-6">
      <h1 className="mb-5 flex items-center gap-2 text-xl font-semibold text-fg">
        <LayoutDashboard className="h-5 w-5 text-accent" /> Dashboard
      </h1>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Consultas totales" value={m.total} icon={MessageSquare} color="text-blue-500" />
        <Kpi
          label="Requieren humano"
          value={m.requiereHumano}
          hint={`${Math.round((m.requiereHumano / (m.total || 1)) * 100)}% del total`}
          icon={TriangleAlert}
          color="text-red-500"
        />
        {m.porNegocio.map((n) => (
          <Kpi
            key={n.negocio}
            label={NEGOCIO_INFO[n.negocio as Negocio]?.label ?? n.negocio}
            value={n.total}
            icon={NEGOCIO_ICON[n.negocio]}
            color={NEGOCIO_INFO[n.negocio as Negocio]?.chart ?? "text-fg"}
          />
        ))}
      </div>

      {/* Para atender ahora */}
      <section className="mb-5 rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Para atender ahora</h2>
          <Link href="/bandeja" className="text-xs text-faint hover:text-fg">
            Ver toda la bandeja →
          </Link>
        </div>
        {prioritarios.length === 0 ? (
          <p className="text-sm text-faint">No hay leads prioritarios pendientes.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {prioritarios.map((lead) => (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className="rounded-lg border border-border p-3 transition-colors hover:bg-hover"
              >
                <div className="mb-1 flex items-center gap-2">
                  <TemperaturaBadge value={lead.temperatura} />
                  <NegocioBadge value={lead.negocio} />
                </div>
                <div className="text-sm font-medium text-fg">{lead.nombre || "Sin nombre"}</div>
                <div className="line-clamp-1 text-xs text-muted">{lead.resumen || lead.mensaje}</div>
                <div className="mt-1 text-[11px] text-faint">
                  {lead.categoria} · {timeAgo(lead.fecha_mensaje)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Consultas por día">
            <AreaChart points={m.porDia.map((d) => ({ label: d.dia, value: d.total }))} />
          </Card>
        </div>
        <Card title="Por estado">
          <Donut segments={estadoSeg} />
        </Card>
        <Card title="Calificación de leads">
          <Donut segments={tempSeg} />
        </Card>
        <Card title="Por negocio">
          <Donut segments={negSeg} />
        </Card>
        <Card title="Top categorías">
          <div className="space-y-2">
            {m.porCategoria.map((c) => {
              const pct = Math.round((c.total / maxCat) * 100);
              return (
                <div key={c.categoria} className="flex items-center gap-3 text-sm">
                  <div className="w-28 shrink-0 truncate text-muted">{c.categoria}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
                    <div className="h-full rounded-full bg-fg/70" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-6 shrink-0 text-right text-xs font-medium text-fg">{c.total}</div>
                </div>
              );
            })}
            {m.porCategoria.length === 0 && <p className="text-sm text-faint">Sin datos.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
