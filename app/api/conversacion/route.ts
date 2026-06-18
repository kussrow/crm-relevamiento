import { NextResponse } from "next/server";
import { fetchMessages } from "@/lib/evolution";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const negocio = searchParams.get("negocio") || "";
  const telefono = searchParams.get("telefono") || "";
  if (!negocio || !telefono) {
    return NextResponse.json({ messages: [] });
  }
  try {
    const messages = await fetchMessages(negocio, telefono);
    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ messages: [], error: String(e) });
  }
}
