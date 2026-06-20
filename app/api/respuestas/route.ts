import { NextResponse } from "next/server";
import { getSesion } from "@/lib/auth";
import { getRespuestas } from "@/lib/respuestas";

export async function GET() {
  try {
    const sesion = await getSesion();
    const respuestas = await getRespuestas(sesion?.negocio);
    return NextResponse.json({ respuestas });
  } catch {
    return NextResponse.json({ respuestas: [] });
  }
}
