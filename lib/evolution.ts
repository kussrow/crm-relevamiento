// Cliente de Evolution API para leer y enviar mensajes de WhatsApp.
const EVO_URL = process.env.EVOLUTION_URL || "https://evolution.openstyle.com.ar";
const EVO_KEY = process.env.EVOLUTION_API_KEY || "";

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
}

type RawMsg = {
  key?: { id?: string; fromMe?: boolean; remoteJid?: string };
  message?: Record<string, unknown>;
  messageTimestamp?: number | string;
};

function jidOf(telefono: string): string {
  return `${telefono.replace(/\D/g, "")}@s.whatsapp.net`;
}

function extractText(m: RawMsg): string {
  const msg = (m.message || {}) as Record<string, unknown>;
  const ext = msg.extendedTextMessage as { text?: string } | undefined;
  const img = msg.imageMessage as { caption?: string } | undefined;
  if (typeof msg.conversation === "string") return msg.conversation;
  if (ext?.text) return ext.text;
  if (img) return img.caption ? `🖼️ ${img.caption}` : "🖼️ Imagen";
  if (msg.audioMessage) return "🎤 Audio";
  if (msg.videoMessage) return "🎬 Video";
  if (msg.documentMessage) return "📎 Documento";
  if (msg.stickerMessage) return "Sticker";
  if (msg.locationMessage) return "📍 Ubicación";
  return "(mensaje)";
}

export async function fetchMessages(
  instance: string,
  telefono: string
): Promise<ChatMessage[]> {
  const res = await fetch(`${EVO_URL}/chat/findMessages/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVO_KEY },
    body: JSON.stringify({ where: { key: { remoteJid: jidOf(telefono) } } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Evolution findMessages ${res.status}`);
  const data = await res.json();
  const recordsUnknown =
    data?.messages?.records ?? data?.messages ?? data?.records ?? data ?? [];
  const arr: RawMsg[] = Array.isArray(recordsUnknown) ? recordsUnknown : [];
  return arr
    .map((m) => ({
      id: m.key?.id ?? String(m.messageTimestamp),
      fromMe: !!m.key?.fromMe,
      text: extractText(m),
      timestamp: Number(m.messageTimestamp) || 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function sendMessage(
  instance: string,
  telefono: string,
  text: string
): Promise<void> {
  const res = await fetch(`${EVO_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVO_KEY },
    body: JSON.stringify({ number: telefono.replace(/\D/g, ""), text }),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Evolution sendText ${res.status}: ${t}`);
  }
}
