import { notFound } from "next/navigation";
import { getPresupuesto, formatMoneda } from "@/lib/presupuestos";
import { equivalente } from "@/lib/format";
import { formatFecha } from "@/lib/scoring";
import { EMPRESA } from "@/lib/empresa";
import { PRESU_ESTADO_INFO } from "@/lib/presupuestos";
import PdfToolbar from "@/components/PdfToolbar";

export const dynamic = "force-dynamic";

const AZUL = "#2563eb";

const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @media print {
    html, body { background: #fff !important; }
    .no-print { display: none !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; }
  }
`;

const fmtVence = (v: string | null) => (v ? v.split("-").reverse().join("/") : null);

export default async function PresupuestoPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPresupuesto(Number(id));
  if (!p) notFound();

  const items = (p.items || []).filter((i) => i.descripcion);
  const est = PRESU_ESTADO_INFO[p.estado] ?? PRESU_ESTADO_INFO.borrador;
  const vence = fmtVence(p.vence_el);
  const eq = equivalente(p.total, p.moneda, p.cotizacion);

  const esVivero = p.negocio === "vivero";
  const NOMBRE = esVivero ? "Vivero Los Aromos" : "Piscinas Los Aromos";
  const COLOR = esVivero ? "#16a34a" : AZUL;

  return (
    <div className="min-h-screen bg-zinc-200 py-6 text-zinc-900">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <PdfToolbar volverHref={`/presupuestos/${p.id}`} />

      <div
        className="sheet mx-auto overflow-hidden bg-white text-zinc-900 shadow-lg"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* Barra superior de color */}
        <div style={{ height: "8px", background: AZUL }} />

        <div style={{ padding: "16mm" }}>
          {/* Encabezado */}
          <header
            className="flex items-start justify-between pb-5"
            style={{ borderBottom: `2px solid ${COLOR}` }}
          >
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: COLOR }}>
                {NOMBRE}
              </h1>
              <div className="mt-2 space-y-0.5 text-xs leading-relaxed text-zinc-500">
                <div>{EMPRESA.direccion}</div>
                <div>
                  WhatsApp {EMPRESA.whatsapp} · {EMPRESA.email}
                </div>
                <div>CUIT: {EMPRESA.cuit}</div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="inline-block rounded-md px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white"
                style={{ background: COLOR }}
              >
                Presupuesto
              </div>
              <div className="mt-2 text-sm text-zinc-500">
                N.º <span className="font-semibold text-zinc-700">{p.id}</span>
              </div>
              <div className="text-sm text-zinc-500">{formatFecha(p.created_at)}</div>
              {vence && (
                <div className="text-sm font-medium text-zinc-700">Válido hasta: {vence}</div>
              )}
            </div>
          </header>

          {/* Cliente + estado */}
          <section className="mt-6 flex items-start justify-between gap-4">
            <div className="rounded-lg bg-zinc-50 px-4 py-3" style={{ minWidth: "60%" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Cliente
              </div>
              <div className="mt-0.5 text-base font-semibold text-zinc-800">
                {p.cliente || "—"}
              </div>
              {p.telefono && <div className="text-sm text-zinc-500">Tel: {p.telefono}</div>}
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Estado
              </div>
              <div
                className="mt-1 inline-block rounded-md px-3 py-1 text-xs font-semibold"
                style={{ background: `${COLOR}14`, color: COLOR }}
              >
                {est.label}
              </div>
            </div>
          </section>

          {/* Ítems */}
          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white">
                <th className="rounded-l-md px-3 py-2.5" style={{ background: COLOR }}>
                  Descripción
                </th>
                <th className="w-20 px-3 py-2.5 text-right" style={{ background: COLOR }}>
                  Cant.
                </th>
                <th className="w-32 px-3 py-2.5 text-right" style={{ background: COLOR }}>
                  Precio unit.
                </th>
                <th className="w-32 rounded-r-md px-3 py-2.5 text-right" style={{ background: COLOR }}>
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-400">
                    Sin ítems cargados.
                  </td>
                </tr>
              )}
              {items.map((it, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-zinc-50" : ""}>
                  <td className="border-b border-zinc-100 px-3 py-2.5">{it.descripcion}</td>
                  <td className="border-b border-zinc-100 px-3 py-2.5 text-right">
                    {it.cantidad}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-2.5 text-right">
                    {formatMoneda(it.precio, p.moneda)}
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-2.5 text-right font-medium">
                    {formatMoneda((Number(it.cantidad) || 0) * (Number(it.precio) || 0), p.moneda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="mt-5 flex flex-col items-end">
            <div
              className="flex w-72 items-center justify-between rounded-lg px-5 py-3"
              style={{ background: `${COLOR}12`, border: `1px solid ${COLOR}33` }}
            >
              <span className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Total
              </span>
              <span className="text-2xl font-extrabold" style={{ color: COLOR }}>
                {formatMoneda(p.total, p.moneda)}
              </span>
            </div>
            {eq && (
              <div className="mt-1 w-72 text-right text-xs text-zinc-500">
                Equivale a {formatMoneda(eq.monto, eq.moneda)} · Cotización US$ 1 ={" "}
                {formatMoneda(p.cotizacion ?? 0)}
              </div>
            )}
          </div>

          {/* Notas / condiciones */}
          {p.notas && (
            <section className="mt-8 rounded-lg border border-zinc-200 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Notas y condiciones
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">{p.notas}</p>
            </section>
          )}

          <footer className="mt-12 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
            Gracias por su consulta · {NOMBRE} · {EMPRESA.email} · WhatsApp{" "}
            {EMPRESA.whatsapp}
          </footer>
        </div>
      </div>
    </div>
  );
}
