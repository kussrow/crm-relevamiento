import { cookies } from "next/headers";
import type { Negocio } from "./types";
import { type Rol, negocioDeRol, verifySessionToken } from "./session";

export type { Rol };

export interface Sesion {
  usuario: string;
  rol: Rol;
  negocio: Negocio | null; // null = admin (ve todo)
}

interface UsuarioConfig {
  usuario: string;
  password: string;
  rol: Rol;
}

// Usuarios fijos definidos por variables de entorno. El admin cae a CRM_PASSWORD
// si no se define CRM_PASS_ADMIN (compatibilidad con la config anterior).
function usuarios(): UsuarioConfig[] {
  const out: UsuarioConfig[] = [];
  const passAdmin = process.env.CRM_PASS_ADMIN || process.env.CRM_PASSWORD;
  if (passAdmin)
    out.push({ usuario: process.env.CRM_USER_ADMIN || "admin", password: passAdmin, rol: "admin" });
  if (process.env.CRM_PASS_PISCINAS)
    out.push({
      usuario: process.env.CRM_USER_PISCINAS || "piscinas",
      password: process.env.CRM_PASS_PISCINAS,
      rol: "piscinas",
    });
  if (process.env.CRM_PASS_VIVERO)
    out.push({
      usuario: process.env.CRM_USER_VIVERO || "vivero",
      password: process.env.CRM_PASS_VIVERO,
      rol: "vivero",
    });
  return out;
}

export function autenticar(
  usuario: string,
  password: string
): { usuario: string; rol: Rol } | null {
  const u = usuarios().find(
    (x) => x.usuario.toLowerCase() === usuario.trim().toLowerCase() && x.password === password
  );
  return u ? { usuario: u.usuario, rol: u.rol } : null;
}

function usuarioDeRol(rol: Rol): string {
  return usuarios().find((x) => x.rol === rol)?.usuario ?? rol;
}

export async function getSesion(): Promise<Sesion | null> {
  const token = (await cookies()).get("crm_session")?.value;
  const rol = await verifySessionToken(token);
  if (!rol) return null;
  return { usuario: usuarioDeRol(rol), rol, negocio: negocioDeRol(rol) };
}
