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
    .map((m) => ({
      id: m.key?.id ?? String(m.messageTimestamp),
      fromMe: !!m.key?.fromMe,
      text: extractText(m),
      timestamp: Number(m.messageTimestamp) || 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
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
