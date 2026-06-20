"use server";

import { revalidatePath } from "next/cache";
import { getSesion } from "@/lib/auth";
import {
  createRespuesta,
  updateRespuesta,
  deleteRespuesta,
  getRespuesta,
} from "@/lib/respuestas";

// El usuario restringido solo puede operar sobre su rubro.
function negocioPermitido(
  rubroSesion: string | null,
  rubroPedido: string | null
): string | null {
  return rubroSesion ?? rubroPedido;
}

export async function crearRespuestaAction(
  negocio: string | null,
  titulo: string,
  texto: string
): Promise<{ ok: boolean; id?: number; error?: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: "no autorizado" };
  if (!titulo.trim() || !texto.trim()) return { ok: false, error: "faltan datos" };
  const id = await createRespuesta(
    negocioPermitido(sesion.negocio, negocio),
    titulo.trim(),
    texto.trim()
  );
  revalidatePath("/respuestas");
  return { ok: true, id };
}

export async function editarRespuestaAction(
  id: number,
  negocio: string | null,
  titulo: string,
  texto: string
): Promise<{ ok: boolean; error?: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: "no autorizado" };
  const actual = await getRespuesta(id);
  if (!actual) return { ok: false, error: "no existe" };
  if (sesion.negocio && actual.negocio !== sesion.negocio) {
    return { ok: false, error: "no autorizado" };
  }
  await updateRespuesta(
    id,
    negocioPermitido(sesion.negocio, negocio),
    titulo.trim(),
    texto.trim()
  );
  revalidatePath("/respuestas");
  return { ok: true };
}

export async function eliminarRespuestaAction(id: number): Promise<void> {
  const sesion = await getSesion();
  if (!sesion) return;
  const actual = await getRespuesta(id);
  if (!actual) return;
  if (sesion.negocio && actual.negocio !== sesion.negocio) return;
  await deleteRespuesta(id);
  revalidatePath("/respuestas");
}
