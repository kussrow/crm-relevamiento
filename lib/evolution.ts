// Cliente de Evolution API para leer y enviar mensajes de WhatsApp.
const EVO_URL = process.env.EVOLUTION_URL || "https://evolution.openstyle.com.ar";
const EVO_KEY = process.env.EVOLUTION_API_KEY || "";

export type TipoMensaje =
  | "texto"
  | "audio"
  | "imagen"
  | "video"
  | "documento"
  | "otro";

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
  tipo: TipoMensaje;
  mediaId?: string; // key.id para pedir el archivo a Evolution
}

type RawMsg = {
  key?: { id?: string; fromMe?: boolean; remoteJid?: string };
  message?: Record<string, unknown>;
  messageTimestamp?: number | string;
};

function classify(m: RawMsg): { text: string; tipo: TipoMensaje } {
  const msg = (m.message || {}) as Record<string, unknown>;
  const ext = msg.extendedTextMessage as { text?: string } | undefined;
  const img = msg.imageMessage as { caption?: string } | undefined;
  if (typeof msg.conversation === "string") return { text: msg.conversation, tipo: "texto" };
  if (ext?.text) return { text: ext.text, tipo: "texto" };
  if (img) return { text: img.caption ? `🖼️ ${img.caption}` : "🖼️ Imagen", tipo: "imagen" };
  if (msg.audioMessage) return { text: "🎤 Audio", tipo: "audio" };
  if (msg.videoMessage) return { text: "🎬 Video", tipo: "video" };
  if (msg.documentMessage) return { text: "📎 Documento", tipo: "documento" };
  if (msg.stickerMessage) return { text: "Sticker", tipo: "otro" };
  if (msg.locationMessage) return { text: "📍 Ubicación", tipo: "otro" };
  return { text: "(mensaje)", tipo: "otro" };
}

async function queryMessages(
  instance: string,
  key: Record<string, string>
): Promise<RawMsg[]> {
  try {
    const res = await fetch(`${EVO_URL}/chat/findMessages/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({ where: { key } }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const recs = data?.messages?.records ?? data?.messages ?? data?.records ?? [];
    return Array.isArray(recs) ? recs : [];
  } catch {
    return [];
  }
}

export async function fetchMessages(
  instance: string,
  telefono: string
): Promise<ChatMessage[]> {
  const num = telefono.replace(/\D/g, "");
  // WhatsApp usa "lid": el teléfono puede estar en remoteJidAlt o en remoteJid
  // (formato clásico @s.whatsapp.net o nuevo @lid). Buscamos en todos y combinamos.
  const results = await Promise.all([
    queryMessages(instance, { remoteJidAlt: `${num}@s.whatsapp.net` }),
    queryMessages(instance, { remoteJid: `${num}@s.whatsapp.net` }),
    queryMessages(instance, { remoteJid: `${num}@lid` }),
  ]);

  const byId = new Map<string, RawMsg>();
  for (const arr of results) {
    for (const m of arr) {
      const id = m.key?.id ?? String(m.messageTimestamp);
      if (!byId.has(id)) byId.set(id, m);
    }
  }

  return [...byId.values()]
    .map((m) => {
      const c = classify(m);
      return {
        id: m.key?.id ?? String(m.messageTimestamp),
        fromMe: !!m.key?.fromMe,
        text: c.text,
        tipo: c.tipo,
        // Guardamos la key.id para poder descargar el archivo (audio, imagen, etc.).
        mediaId:
          c.tipo === "audio" ||
          c.tipo === "imagen" ||
          c.tipo === "video" ||
          c.tipo === "documento"
            ? m.key?.id
            : undefined,
        timestamp: Number(m.messageTimestamp) || 0,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Descarga el archivo (audio/imagen/etc.) de un mensaje desde Evolution.
export async function fetchMediaBase64(
  instance: string,
  messageId: string
): Promise<{ bytes: Buffer; mimetype: string } | null> {
  try {
    const res = await fetch(
      `${EVO_URL}/chat/getBase64FromMediaMessage/${instance}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: EVO_KEY },
        body: JSON.stringify({
          message: { key: { id: messageId } },
          convertToMp4: false,
        }),
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.base64) return null;
    return {
      bytes: Buffer.from(data.base64, "base64"),
      mimetype: data.mimetype || "audio/ogg",
    };
  } catch {
    return null;
  }
}

// Normaliza un teléfono argentino al formato que espera WhatsApp:
// 54 (país) + 9 (celular) + código de área + número, sin 0 ni 15.
// Es idempotente: si ya viene con 54/549, lo deja consistente.
export function normalizeArPhone(raw: string): string {
  let n = (raw || "").replace(/\D/g, "");
  if (!n) return "";
  if (n.startsWith("00")) n = n.slice(2); // prefijo internacional
  if (n.startsWith("54")) {
    let rest = n.slice(2);
    if (rest.startsWith("9")) rest = rest.slice(1); // sacamos el 9, lo re-agregamos
    if (rest.startsWith("0")) rest = rest.slice(1); // 0 de larga distancia
    return "549" + rest;
  }
  if (n.startsWith("0")) n = n.slice(1);
  return "549" + n;
}

export async function sendMessage(
  instance: string,
  telefono: string,
  text: string
): Promise<void> {
  const number = normalizeArPhone(telefono);
  const res = await fetch(`${EVO_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVO_KEY },
    body: JSON.stringify({ number, text }),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Evolution sendText ${res.status}: ${t}`);
  }
}
