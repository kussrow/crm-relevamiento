import { NextResponse } from "next/server";
import { getSesion } from "@/lib/auth";
import { getRespuesta, getAdjunto, setAdjunto, clearAdjunto } from "@/lib/respuestas";

const MAX_BYTES = 16 * 1024 * 1024; // 16 MB

// Puede ver: el adjunto de su rubro o el de "todos" (null).
function puedeVer(rubroSesion: string | null, rubroResp: string | null): boolean {
  return !rubroSesion || rubroResp === rubroSesion || rubroResp === null;
}
// Puede modificar: solo el de su propio rubro (los restringidos no tocan "todos").
function puedeEditar(rubroSesion: string | null, rubroResp: string | null): boolean {
  return !rubroSesion || rubroResp === rubroSesion;
}

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id") || "0");
  const sesion = await getSesion();
  if (!sesion) return new Response("no autorizado", { status: 401 });
  const resp = await getRespuesta(id);
  if (!resp || !puedeVer(sesion.negocio, resp.negocio)) {
    return new Response("no encontrado", { status: 404 });
  }
  const adj = await getAdjunto(id);
  if (!adj) return new Response("sin adjunto", { status: 404 });
  return new Response(new Uint8Array(adj.datos), {
    headers: {
      "Content-Type": adj.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(adj.nombre)}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

export async function POST(request: Request) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "no autorizado" }, { status: 401 });

  const form = await request.formData();
  const id = Number(form.get("id") || "0");
  const file = form.get("file");

  const resp = await getRespuesta(id);
  if (!resp || !puedeEditar(sesion.negocio, resp.negocio)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "archivo vacío" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "supera 16 MB" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  await setAdjunto(id, buf, file.type || "application/octet-stream", file.name || "adjunto");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const sesion = await getSesion();
  if (!sesion) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id") || "0");
  const resp = await getRespuesta(id);
  if (!resp || !puedeEditar(sesion.negocio, resp.negocio)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  }
  await clearAdjunto(id);
  return NextResponse.json({ ok: true });
}
