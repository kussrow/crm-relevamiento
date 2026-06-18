import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const leads = await query(
      `SELECT id, nombre, negocio, categoria
       FROM leads
       WHERE requiere_humano = true AND estado = 'nuevo'
       ORDER BY score DESC, fecha_mensaje DESC NULLS LAST
       LIMIT 8`
    );
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ leads: [] });
  }
}
