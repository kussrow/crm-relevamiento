import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import EstadoSelector from "@/components/EstadoSelector";
import NotasEditor from "@/components/NotasEditor";
import Conversacion from "@/components/Conversacion";
import BotonEliminar from "@/components/BotonEliminar";
import { whatsappLink, formatFecha } from "@/lib/scoring";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();

  const wa = whatsappLink(lead.telefono);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href="/bandeja" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-800">
        ← Volver a la bandeja
      </Link>

      {/* Encabezado */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900">
                {lead.nombre || "Sin nombre"}
              </h1>
              <NegocioBadge value={lead.negocio} />
              <TemperaturaBadge value={lead.temperatura} />
              {lead.requiere_humano && (
                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  ⚠️ Requiere humano
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {lead.telefono} · {formatFecha(lead.fecha_mensaje)} ·{" "}
              <span className="font-medium text-slate-600">score {lead.score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                💬 Abrir WhatsApp
              </a>
            )}
            <BotonEliminar id={lead.id} redirectTo="/bandeja" />
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            Estado del lead
          </div>
          <EstadoSelector id={lead.id} current={lead.estado} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Conversación + mensaje + notas */}
        <div className="space-y-4 md:col-span-2">
          {lead.telefono && (
            <Conversacion negocio={lead.negocio} telefono={lead.telefono} />
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              Mensaje original
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">
                {lead.tipo_mensaje}
              </span>
            </h2>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{lead.mensaje}</p>
            {lead.pregunta && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-400">Pregunta principal: </span>
                <span className="font-medium text-slate-700">{lead.pregunta}</span>
              </p>
            )}
          </section>

          {lead.respuesta_sugerida && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="mb-2 text-sm font-semibold text-emerald-800">
                💡 Respuesta sugerida (para el futuro chatbot)
              </h2>
              <p className="text-sm text-emerald-900">{lead.respuesta_sugerida}</p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Notas de seguimiento</h2>
            <NotasEditor id={lead.id} initial={lead.notas || ""} />
          </section>
        </div>

        {/* Clasificación */}
        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Clasificación IA</h2>
          <dl className="space-y-3">
            <Field label="Categoría" value={lead.categoria} />
            <Field label="Subcategoría" value={lead.subcategoria} />
            <Field label="Producto" value={lead.producto} />
            <Field label="Detalle" value={lead.detalle} />
            <Field label="Intención de compra" value={lead.intencion} />
            <Field label="Urgencia" value={lead.urgencia} />
            <Field label="Ciudad" value={lead.ciudad} />
            <Field label="Provincia" value={lead.provincia} />
            <Field label="Forma de pago" value={lead.forma_pago} />
            <Field label="Precio mencionado" value={lead.precio} />
            <Field label="Cantidad" value={lead.cantidad} />
            <Field label="Problema reportado" value={lead.problema} />
            <Field label="Etiquetas" value={lead.etiquetas} />
          </dl>
        </aside>
      </div>
    </div>
  );
}
