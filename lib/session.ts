// Sesión basada en un token firmado (HMAC-SHA256) con Web Crypto, de modo que
// funcione tanto en el middleware (edge) como en el server (node).
import type { Negocio } from "./types";

export type Rol = "admin" | "piscinas" | "vivero";
export const ROLES: Rol[] = ["admin", "piscinas", "vivero"];

// Rubro al que está limitado un rol. admin = null (ve todo).
export function negocioDeRol(rol: Rol): Negocio | null {
  return rol === "admin" ? null : rol;
}

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-cambiar";
}

async function hmacHex(msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token = "<rol>.<hmac(rol)>". El rol va en claro pero firmado: no se puede falsificar.
export async function createSessionToken(rol: Rol): Promise<string> {
  return `${rol}.${await hmacHex(rol)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<Rol | null> {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const rol = token.slice(0, i) as Rol;
  const sig = token.slice(i + 1);
  if (!ROLES.includes(rol)) return null;
  const esperado = await hmacHex(rol);
  return safeEqual(sig, esperado) ? rol : null;
}
