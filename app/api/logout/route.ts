import { NextResponse } from "next/server";

export async function POST() {
  // Redirección relativa (ver nota en /api/login): evita el host interno del contenedor.
  const res = new NextResponse(null, { status: 303, headers: { Location: "/login" } });
  res.cookies.set("crm_session", "", { path: "/", maxAge: 0 });
  return res;
}
