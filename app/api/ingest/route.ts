import { NextResponse } from "next/server";
import { insertLead, type LeadInput } from "@/lib/leads";

// Endpoint de ingesta para n8n. Protegido con header x-ingest-token.
export async function POST(request: Request) {
  const token = request.headers.get("x-ingest-token");
  if (!process.env.INGEST_TOKEN || token !== process.env.INGEST_TOKEN) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  let body: LeadInput;
  try {
    body = (await request.json()) as LeadInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const id = await insertLead({ ...body, raw: body.raw ?? body });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    console.error("[crm] error insertando lead:", e);
    return NextResponse.json({ error: "error al insertar" }, { status: 500 });
  }
}
