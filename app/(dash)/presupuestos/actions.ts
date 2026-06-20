"use server";

import { revalidatePath } from "next/cache";
import {
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,
  getPresupuesto,
  setEstadoPresupuesto,
  type PresupuestoInput,
} from "@/lib/presupuestos";
import { sendDocument } from "@/lib/evolution";
import { generarPresupuestoPdf } from "@/lib/presupuesto-pdf";
import { formatMoneda } from "@/lib/format";
import { getProductoDux, getListaPrecioDefault, precioPorLista } from "@/lib/productos";

// Busca un producto de Dux (catálogo local) por código y devuelve descripción y
// precio según la lista configurada para el rubro.
export async function buscarProductoDuxAction(
  cod: string,
  negocio?: string | null
): Promise<{ descripcion: string; precio: number; lista: string | null } | null> {
  const p = await getProductoDux(cod);
  if (!p) return null;
  const lista = await getListaPrecioDefault(negocio);
  return {
    descripcion: p.descripcion ?? "",
    precio: precioPorLista(p, lista),
    lista,
  };
}

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
    const pdf = await generarPresupuestoPdf(p);
    const base64 = Buffer.from(pdf).toString("base64");
    const fileName = `presupuesto-${p.id}.pdf`;
    const caption =
      (p.cliente ? `Hola ${p.cliente}! ` : "") +
      `Te paso el presupuesto N.º ${p.id}.\n` +
      `Total: ${formatMoneda(p.total)}` +
      (p.vence_el
        ? `\nVálido hasta: ${p.vence_el.split("-").reverse().join("/")}`
        : "");

    await sendDocument(p.negocio, p.telefono, base64, fileName, caption);
    await setEstadoPresupuesto(id, "enviado");
    revalidatePath("/presupuestos");
    revalidatePath(`/presupuestos/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
