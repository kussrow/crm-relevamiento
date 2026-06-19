import { fetchMediaBase64 } from "@/lib/evolution";

// Devuelve el audio (u otro media) de un mensaje de WhatsApp para reproducirlo.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const negocio = searchParams.get("negocio") || "";
  const id = searchParams.get("id") || "";
  if (!negocio || !id) {
    return new Response("Faltan parámetros", { status: 400 });
  }
  const media = await fetchMediaBase64(negocio, id);
  if (!media) {
    return new Response("Audio no disponible", { status: 404 });
  }
  return new Response(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.mimetype,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
