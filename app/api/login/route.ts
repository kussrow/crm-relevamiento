import { NextResponse } from "next/server";
import { autenticar } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const form = await request.formData();
  const usuario = String(form.get("usuario") ?? "");
  const password = String(form.get("password") ?? "");

  const auth = autenticar(usuario, password);
  if (auth) {
    // Redirección relativa: el navegador la resuelve contra el dominio público
    // (detrás de nginx, request.url tiene el host interno del contenedor).
    const res = new NextResponse(null, { status: 303, headers: { Location: "/" } });
    res.cookies.set("crm_session", await createSessionToken(auth.rol), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return res;
  }

  return new NextResponse(null, { status: 303, headers: { Location: "/login?error=1" } });
}
