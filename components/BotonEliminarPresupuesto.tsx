"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { eliminarPresupuesto } from "@/app/(dash)/presupuestos/actions";

export default function BotonEliminarPresupuesto({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const handle = () => {
    if (!confirm("¿Eliminar este presupuesto? No se puede deshacer.")) return;
    start(async () => {
      await eliminarPresupuesto(id);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handle}
      disabled={pending}
      title="Eliminar presupuesto"
      className="rounded-md p-1.5 text-faint transition-colors hover:bg-hover hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
