import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getPresupuestos } from "@/lib/presupuestos";
import PresupuestosTabla from "@/components/PresupuestosTabla";

export const dynamic = "force-dynamic";

export default async function PresupuestosPage() {
  const presupuestos = await getPresupuestos();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-fg">
            <FileText className="h-5 w-5 text-accent" /> Presupuestos
          </h1>
          <p className="text-sm text-muted">{presupuestos.length} en total</p>
        </div>
        <Link
          href="/presupuestos/nuevo"
          className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo presupuesto
        </Link>
      </div>

      <PresupuestosTabla presupuestos={presupuestos} />
    </div>
  );
}
