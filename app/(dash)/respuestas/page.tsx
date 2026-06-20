import { MessageSquareText } from "lucide-react";
import { getRespuestas } from "@/lib/respuestas";
import { getSesion } from "@/lib/auth";
import RespuestasManager from "@/components/RespuestasManager";
import type { Negocio } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  const sesion = await getSesion();
  const respuestas = await getRespuestas(sesion?.negocio);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-fg">
          <MessageSquareText className="h-5 w-5 text-accent" /> Respuestas frecuentes
        </h1>
        <p className="text-sm text-muted">
          Mensajes para reutilizar en el chat con un clic.
        </p>
      </div>

      <RespuestasManager
        respuestas={respuestas}
        negocioFijo={(sesion?.negocio as Negocio | null) ?? null}
      />
    </div>
  );
}
