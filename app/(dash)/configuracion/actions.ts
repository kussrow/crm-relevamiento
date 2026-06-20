"use server";

import { revalidatePath } from "next/cache";
import { getSesion } from "@/lib/auth";
import { setConfig } from "@/lib/config";

const SCOPES = ["default", "piscinas", "vivero"] as const;
type Scope = (typeof SCOPES)[number];

// Guarda la lista de precios de Dux por defecto (global o por rubro).
export async function setListaPrecioAction(
  scope: Scope,
  lista: string
): Promise<{ ok: boolean }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false };
  // El usuario restringido solo puede tocar la lista de su propio rubro.
  if (sesion.negocio && scope !== sesion.negocio) return { ok: false };
  if (!SCOPES.includes(scope)) return { ok: false };
  await setConfig(`dux_lista_${scope}`, lista);
  revalidatePath("/configuracion");
  return { ok: true };
}
