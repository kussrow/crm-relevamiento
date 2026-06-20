import { NextResponse } from "next/server";
import { getAllBots, setBot } from "@/lib/config";
import { getSesion } from "@/lib/auth";

export async function GET() {
  try {
    return NextResponse.json(await getAllBots());
  } catch {
    return NextResponse.json({ piscinas: false, vivero: false });
  }
}

export async function POST(request: Request) {
  let body: { negocio?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body.negocio) {
    return NextResponse.json({ error: "falta negocio" }, { status: 400 });
  }
  // Usuario restringido: solo puede controlar el bot de su rubro.
  const sesion = await getSesion();
  if (sesion?.negocio && body.negocio !== sesion.negocio) {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  }
  await setBot(body.negocio, !!body.enabled);
  return NextResponse.json({ ok: true });
}
