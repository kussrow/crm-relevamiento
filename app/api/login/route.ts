import { NextResponse } from "next/server";
import { autenticar } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const form = await request.formData();
  const usuario = String(form.get("usuario") ?? "");
  const password = String(form.get("password") ?? "");

  const auth = autenticar(usuario, password);
  if (auth) {
    const res = NextResponse.redirect(new URL("/", request.url), 303);
    res.cookies.set("crm_session", await createSessionToken(auth.rol), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return res;
  }

  return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
}
