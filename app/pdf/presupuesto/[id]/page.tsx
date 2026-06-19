import { notFound } from "next/navigation";
import { getPresupuesto, formatMoneda } from "@/lib/presupuestos";
import { formatFecha } from "@/lib/scoring";
import { EMPRESA } from "@/lib/empresa";
import { PRESU_ESTADO_INFO } from "@/lib/presupuestos";
import PdfToolbar from "@/components/PdfToolbar";

export const dynamic = "force-dynamic";

const PRINT_CSS = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: #fff !important; }
    .no-print { display: none !important; }
    .sheet { box-shadow: none !important; margin: 0 !important; }
  }
`;

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

  return (
    <div className="min-h-screen bg-zinc-200 py-6 text-zinc-900">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <PdfToolbar volverHref={`/presupuestos/${p.id}`} />

      <div
        className="sheet mx-auto bg-white text-zinc-900 shadow-lg"
        style={{ width: "210mm", minHeight: "297mm", padding: "16mm" }}
      >
        {/* Encabezado: empresa + título */}
        <header className="flex items-start justify-between border-b-2 border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{EMPRESA.nombre}</h1>
            <div className="mt-1 text-xs leading-relaxed text-zinc-600">
              <div>{EMPRESA.direccion}</div>
              <div>
                WhatsApp {EMPRESA.whatsapp} · {EMPRESA.email}
              </div>
              <div>CUIT: {EMPRESA.cuit}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold uppercase tracking-widest text-zinc-700">
              Presupuesto
            </div>
            <div className="mt-1 text-sm text-zinc-600">N.º {p.id}</div>
            <div className="text-sm text-zinc-600">{formatFecha(p.created_at)}</div>
            {p.vence_el && (
              <div className="text-sm font-medium text-zinc-700">
                Válido hasta: {p.vence_el.split("-").reverse().join("/")}
              </div>
            )}
            <div className="mt-1 inline-block rounded border border-zinc-300 px-2 py-0.5 text-xs uppercase text-zinc-600">
              {est.label}
            </div>
          </div>
        </header>

        {/* Cliente */}
        <section className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Cliente
          </div>
          <div className="mt-1 text-base font-medium">{p.cliente || "—"}</div>
          {p.telefono && <div className="text-sm text-zinc-600">Tel: {p.telefono}</div>}
        </section>

        {/* Ítems */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-300 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-2">Descripción</th>
              <th className="w-20 py-2 text-right">Cant.</th>
              <th className="w-32 py-2 text-right">Precio unit.</th>
              <th className="w-32 py-2 text-right">Subtotal</th>
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
              <tr key={i} className="border-b border-zinc-200">
                <td className="py-2 pr-2">{it.descripcion}</td>
                <td className="py-2 text-right">{it.cantidad}</td>
                <td className="py-2 text-right">{formatMoneda(it.precio)}</td>
                <td className="py-2 text-right">
                  {formatMoneda((Number(it.cantidad) || 0) * (Number(it.precio) || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 border-t-2 border-zinc-800 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Total
              </span>
              <span className="text-xl font-bold">{formatMoneda(p.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas / condiciones */}
        {p.notas && (
          <section className="mt-8 border-t border-zinc-200 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notas y condiciones
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{p.notas}</p>
          </section>
        )}

        <footer className="mt-12 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
          {EMPRESA.nombre} · {EMPRESA.email} · WhatsApp {EMPRESA.whatsapp}
        </footer>
      </div>
    </div>
  );
}
