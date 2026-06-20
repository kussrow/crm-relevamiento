"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquareText, Paperclip, X } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import type { ChatMessage } from "@/lib/evolution";

type RespuestaRapida = {
  id: number;
  titulo: string;
  texto: string;
  tiene_adjunto?: boolean;
  adjunto_nombre?: string | null;
  adjunto_mime?: string | null;
};

export default function Conversacion({
  negocio,
  telefono,
}: {
  negocio: string;
  telefono: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [respuestas, setRespuestas] = useState<RespuestaRapida[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversacion?negocio=${encodeURIComponent(negocio)}&telefono=${encodeURIComponent(telefono)}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
      setError(data.error ? "No se pudo leer la conversación" : null);
    } catch {
      setError("No se pudo leer la conversación");
    } finally {
      setLoading(false);
    }
  }, [negocio, telefono]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    fetch("/api/respuestas")
      .then((r) => r.json())
      .then((d) => setRespuestas(d.respuestas || []))
      .catch(() => {});
  }, []);

  const usarRespuesta = async (r: RespuestaRapida) => {
    setTexto((prev) => (prev ? `${prev}\n${r.texto}` : r.texto));
    setMenuOpen(false);
    // Si la respuesta tiene un adjunto, lo dejamos listo para enviar.
    if (r.tiene_adjunto) {
      try {
        const res = await fetch(`/api/respuestas/adjunto?id=${r.id}`);
        if (res.ok) {
          const blob = await res.blob();
          setArchivo(
            new File([blob], r.adjunto_nombre || "adjunto", {
              type: r.adjunto_mime || blob.type,
            })
          );
        }
      } catch {
        /* si falla, queda solo el texto */
      }
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const enviar = async () => {
    if (!texto.trim() && !archivo) return;
    setSending(true);
    try {
      let res: Response;
      if (archivo) {
        const fd = new FormData();
        fd.append("negocio", negocio);
        fd.append("telefono", telefono);
        fd.append("caption", texto);
        fd.append("file", archivo);
        res = await fetch("/api/responder/media", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/responder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ negocio, telefono, texto }),
        });
      }
      if (res.ok) {
        setTexto("");
        setArchivo(null);
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(load, 1000);
      } else {
        const d = await res.json();
        setError(d.error || "No se pudo enviar");
      }
    } catch {
      setError("No se pudo enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-[28rem] min-w-0 flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-sm font-semibold text-fg">Conversación</h2>
        <button
          onClick={load}
          className="text-xs text-faint hover:text-fg"
          title="Actualizar"
        >
          Actualizar
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-hover p-4">
        {loading && <p className="text-center text-sm text-faint">Cargando…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-faint">
            {error ?? "Sin mensajes en esta conversación."}
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.fromMe
                  ? "rounded-br-sm bg-accent text-accent-fg"
                  : "rounded-bl-sm border border-border bg-card text-fg"
              }`}
            >
              {m.tipo === "audio" && m.mediaId ? (
                <audio
                  controls
                  preload="none"
                  src={`/api/audio?negocio=${encodeURIComponent(negocio)}&id=${encodeURIComponent(m.mediaId)}`}
                  className="w-56 max-w-full"
                >
                  🎤 Audio
                </audio>
              ) : m.tipo === "imagen" && m.mediaId ? (
                <ImagenMensaje
                  negocio={negocio}
                  mediaId={m.mediaId}
                  caption={m.text.replace(/^🖼️\s*/, "")}
                />
              ) : (
                m.text
              )}
              <div className={`mt-0.5 text-[10px] ${m.fromMe ? "text-faint" : "text-faint"}`}>
                {m.timestamp
                  ? new Date(m.timestamp * 1000).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative border-t border-border p-2">
        {error && <p className="px-2 pb-1 text-xs text-red-500">{error}</p>}
        {menuOpen && respuestas.length > 0 && (
          <div className="absolute bottom-full left-2 z-20 mb-1 max-h-64 w-72 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
            <div className="px-2 py-1 text-xs font-medium text-faint">Respuestas frecuentes</div>
            {respuestas.map((r) => (
              <button
                key={r.id}
                onClick={() => usarRespuesta(r)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-hover"
              >
                <div className="flex items-center gap-1.5 font-medium text-fg">
                  {r.titulo}
                  {r.tiene_adjunto && <Paperclip className="h-3 w-3 text-faint" />}
                </div>
                <div className="truncate text-xs text-faint">{r.texto}</div>
              </button>
            ))}
          </div>
        )}
        {archivo && (
          <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-hover px-2 py-1.5">
            {archivo.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(archivo)}
                alt={archivo.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <Paperclip className="h-4 w-4 text-faint" />
            )}
            <span className="min-w-0 flex-1 truncate text-xs text-fg">{archivo.name}</span>
            <button
              onClick={() => {
                setArchivo(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="rounded p-0.5 text-faint hover:bg-card hover:text-red-500"
              title="Quitar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Adjuntar archivo o foto"
            className="rounded-md border border-border p-2 text-muted hover:bg-hover hover:text-fg"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <EmojiPicker onSelect={(e) => setTexto((t) => t + e)} />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            disabled={respuestas.length === 0}
            title="Respuestas frecuentes"
            className="rounded-md border border-border p-2 text-muted hover:bg-hover hover:text-fg disabled:opacity-40"
          >
            <MessageSquareText className="h-4 w-4" />
          </button>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            rows={1}
            placeholder={archivo ? "Mensaje para el archivo (opcional)…" : "Escribí una respuesta…"}
            className="max-h-28 min-w-0 flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-muted"
          />
          <button
            onClick={enviar}
            disabled={sending || (!texto.trim() && !archivo)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent disabled:opacity-40"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ImagenMensaje({
  negocio,
  mediaId,
  caption,
}: {
  negocio: string;
  mediaId: string;
  caption: string;
}) {
  const [error, setError] = useState(false);
  const src = `/api/audio?negocio=${encodeURIComponent(negocio)}&id=${encodeURIComponent(mediaId)}`;
  const tieneCaption = caption && caption !== "Imagen";

  if (error) {
    return <span>🖼️ {tieneCaption ? caption : "Imagen"}</span>;
  }

  return (
    <div className="space-y-1">
      <a href={src} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={tieneCaption ? caption : "Imagen"}
          onError={() => setError(true)}
          className="max-h-64 w-56 max-w-full cursor-pointer rounded-lg object-cover"
        />
      </a>
      {tieneCaption && <div>{caption}</div>}
    </div>
  );
}
