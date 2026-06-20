import { NextResponse } from "next/server";
import { getSesion } from "@/lib/auth";
import { sincronizarCatalogo, getSyncEstado, duxConfigurado } from "@/lib/dux";

export async function GET() {
  return NextResponse.json(await getSyncEstado());
}

export async function POST() {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  if (!duxConfigurado()) {
    return NextResponse.json({ error: "Dux no está configurado" }, { status: 400 });
  }
  const estado = await getSyncEstado();
  if (estado.estado === "corriendo") {
    return NextResponse.json({ ok: true, yaCorriendo: true });
  }
  // Fire-and-forget: el catálogo es grande y el rate limit obliga a esperar.
  // En el server persistente (docker) la promesa sigue corriendo tras responder.
  void sincronizarCatalogo();
  return NextResponse.json({ ok: true, started: true });
}
