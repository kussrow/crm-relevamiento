import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/evolution";

export async function POST(request: Request) {
  let body: { negocio?: string; telefono?: string; texto?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { negocio, telefono, texto } = body;
  if (!negocio || !telefono || !texto?.trim()) {
    return NextResponse.json({ error: "faltan datos" }, { status: 400 });
  }
  try {
    await sendMessage(negocio, telefono, texto.trim());
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[crm] error enviando WhatsApp:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
