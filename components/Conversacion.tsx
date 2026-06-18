"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/evolution";

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
  const scrollRef = useRef<HTMLDivElement>(null);

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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const enviar = async () => {
    if (!texto.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocio, telefono, texto }),
      });
      if (res.ok) {
        setTexto("");
        setTimeout(load, 800);
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
    <section className="flex h-[28rem] flex-col rounded-lg border border-border bg-card">
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
              {m.text}
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

      <div className="border-t border-border p-2">
        {error && <p className="px-2 pb-1 text-xs text-red-500">{error}</p>}
        <div className="flex items-end gap-2">
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
            placeholder="Escribí una respuesta…  (Enter para enviar)"
            className="max-h-28 flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-muted"
          />
          <button
            onClick={enviar}
            disabled={sending || !texto.trim()}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent disabled:opacity-40"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </div>
    </section>
  );
}
