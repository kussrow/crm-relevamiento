import { NextResponse } from "next/server";
import { sendMedia, mediaTypeFromMime } from "@/lib/evolution";

const MAX_BYTES = 16 * 1024 * 1024; // 16 MB

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "form inválido" }, { status: 400 });
  }

  const negocio = String(form.get("negocio") ?? "");
  const telefono = String(form.get("telefono") ?? "");
  const caption = String(form.get("caption") ?? "");
  const file = form.get("file");

  if (!negocio || !telefono) {
    return NextResponse.json({ error: "faltan datos" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "archivo vacío" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "el archivo supera los 16 MB" }, { status: 400 });
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const mime = file.type || "application/octet-stream";
    await sendMedia(negocio, telefono, base64, mime, file.name || "archivo", caption, mediaTypeFromMime(mime));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[crm] error enviando media:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
