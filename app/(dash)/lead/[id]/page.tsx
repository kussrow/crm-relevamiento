import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads";
import { TemperaturaBadge, NegocioBadge } from "@/components/badges";
import EstadoSelector from "@/components/EstadoSelector";
import DatosCliente from "@/components/DatosCliente";
import NotasEditor from "@/components/NotasEditor";
import Conversacion from "@/components/Conversacion";
import BotonEliminar from "@/components/BotonEliminar";
import { whatsappLink, formatFecha } from "@/lib/scoring";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="text-sm text-fg">{value}</dd>
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
      <Link href="/bandeja" className="mb-4 inline-block text-sm text-muted hover:text-fg">
        ← Volver a la bandeja
      </Link>

      {/* Encabezado */}
      <div className="mb-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-lg font-semibold text-fg">
                {lead.nombre || "Sin nombre"}
              </h1>
              <NegocioBadge value={lead.negocio} />
              <TemperaturaBadge value={lead.temperatura} />
              {lead.requiere_humano && (
                <span className="text-xs font-medium text-red-500">Requiere atención</span>
              )}
            </div>
            <div className="text-sm text-muted">
              {lead.telefono} · {formatFecha(lead.fecha_mensaje)} ·{" "}
              <span className="font-medium text-muted">score {lead.score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent"
              >
                Abrir WhatsApp
              </a>
            )}
            <Link
              href={`/presupuestos/nuevo?lead=${lead.id}&cliente=${encodeURIComponent(
                lead.nombre || ""
              )}&telefono=${encodeURIComponent(lead.telefono || "")}&negocio=${lead.negocio}`}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-hover hover:text-fg"
            >
              Crear presupuesto
            </Link>
            <BotonEliminar id={lead.id} redirectTo="/bandeja" />
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-2 text-xs uppercase tracking-wide text-faint">
            Estado del lead
          </div>
          <EstadoSelector id={lead.id} current={lead.estado} />
        </div>
      </div>

      {/* Chat + datos del cliente (con solapas) a la par */}
      {lead.telefono ? (
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <Conversacion negocio={lead.negocio} telefono={lead.telefono} />
          <DatosCliente
            id={lead.id}
            personales={lead.datos_personales}
            facturacion={lead.datos_facturacion}
            fallback={{
              nombre: lead.nombre,
              telefono: lead.telefono,
              localidad: lead.ciudad,
              provincia: lead.provincia,
            }}
          />
        </div>
      ) : (
        <div className="mb-4">
          <DatosCliente
            id={lead.id}
            personales={lead.datos_personales}
            facturacion={lead.datos_facturacion}
            fallback={{
              nombre: lead.nombre,
              telefono: lead.telefono,
              localidad: lead.ciudad,
              provincia: lead.provincia,
            }}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Mensaje + notas */}
        <div className="space-y-4 md:col-span-2">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2 text-sm font-semibold text-fg">
              Mensaje original
              <span className="ml-2 rounded bg-hover px-1.5 py-0.5 text-xs font-normal text-muted">
                {lead.tipo_mensaje}
              </span>
            </h2>
            <p className="whitespace-pre-wrap text-sm text-fg">{lead.mensaje}</p>
            {lead.pregunta && (
              <p className="mt-3 border-t border-border pt-3 text-sm">
                <span className="text-faint">Pregunta principal: </span>
                <span className="font-medium text-fg">{lead.pregunta}</span>
              </p>
            )}
          </section>

          {lead.respuesta_sugerida && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-2 text-sm font-semibold text-fg">
                Respuesta sugerida
              </h2>
              <p className="text-sm text-muted">{lead.respuesta_sugerida}</p>
            </section>
          )}

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-fg">Notas de seguimiento</h2>
            <NotasEditor id={lead.id} initial={lead.notas || ""} />
          </section>
        </div>

        {/* Clasificación */}
        <aside className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-fg">Clasificación IA</h2>
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
