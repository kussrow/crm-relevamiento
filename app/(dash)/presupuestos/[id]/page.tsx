import Link from "next/link";
import { notFound } from "next/navigation";
import { getPresupuesto } from "@/lib/presupuestos";
import PresupuestoForm from "@/components/PresupuestoForm";

export const dynamic = "force-dynamic";

export default async function EditarPresupuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(Number(id));
  if (!presupuesto) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/presupuestos"
        className="mb-4 inline-block text-sm text-muted hover:text-fg"
      >
        ← Volver a presupuestos
      </Link>
      <h1 className="mb-5 text-xl font-semibold text-fg">
        Presupuesto #{presupuesto.id}
      </h1>
      <PresupuestoForm presupuesto={presupuesto} />
    </div>
  );
}
