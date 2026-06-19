"use server";

import { revalidatePath } from "next/cache";
import {
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  getPresupuesto,
  setEstadoPresupuesto,
  presupuestoToTexto,
  type PresupuestoInput,
} from "@/lib/presupuestos";
import { sendMessage } from "@/lib/evolution";

export async function guardarPresupuesto(
  id: number | null,
  data: PresupuestoInput
): Promise<number> {
  let pid: number;
  if (id) {
    await updatePresupuesto(id, data);
    pid = id;
  } else {
    pid = await createPresupuesto(data);
  }
  revalidatePath("/presupuestos");
  return pid;
}

export async function eliminarPresupuesto(id: number) {
  await deletePresupuesto(id);
  revalidatePath("/presupuestos");
}

export async function enviarPresupuesto(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  const p = await getPresupuesto(id);
  if (!p) return { ok: false, error: "No existe" };
  if (!p.negocio || !p.telefono)
    return { ok: false, error: "Falta negocio o teléfono" };
  try {
    await sendMessage(p.negocio, p.telefono, presupuestoToTexto(p));
    await setEstadoPresupuesto(id, "enviado");
    revalidatePath("/presupuestos");
    revalidatePath(`/presupuestos/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
