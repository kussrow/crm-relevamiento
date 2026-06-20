import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSesion } from "@/lib/auth";

export async function GET() {
  try {
    const sesion = await getSesion();
    const params: unknown[] = [];
    let extra = "";
    if (sesion?.negocio) {
      params.push(sesion.negocio);
      extra = ` AND negocio = $${params.length}`;
    }
    const leads = await query(
      `SELECT id, nombre, negocio, categoria
       FROM leads
       WHERE requiere_humano = true AND estado = 'nuevo'${extra}
       ORDER BY score DESC, fecha_mensaje DESC NULLS LAST
       LIMIT 8`,
      params
    );
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ leads: [] });
  }
}
