import Link from "next/link";
import PresupuestoForm from "@/components/PresupuestoForm";
import SelectorLeadPresupuesto from "@/components/SelectorLeadPresupuesto";
import { getLeadsCompletos } from "@/lib/leads";
import { getSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NuevoPresupuestoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sesion = await getSesion();
  const prefill = {
    cliente: sp.cliente,
    telefono: sp.telefono,
    // El rubro del usuario restringido manda sobre el de la URL.
    negocio: sesion?.negocio ?? sp.negocio,
    lead_id: sp.lead ? Number(sp.lead) : undefined,
  };

  const leads = await getLeadsCompletos(sesion?.negocio);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/presupuestos"
        className="mb-4 inline-block text-sm text-muted hover:text-fg"
      >
        ← Volver a presupuestos
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-fg">Nuevo presupuesto</h1>

      <SelectorLeadPresupuesto leads={leads} selectedId={prefill.lead_id} />

      {/* key fuerza a remontar el form (y refrescar el prellenado) al cambiar de lead */}
      <PresupuestoForm
        key={prefill.lead_id ?? "nuevo"}
        presupuesto={null}
        prefill={prefill}
        negocioFijo={sesion?.negocio ?? undefined}
      />
    </div>
  );
}
