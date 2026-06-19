"use client";

import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";

type Bots = { piscinas: boolean; vivero: boolean };

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        on ? "bg-emerald-500" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function BotControl() {
  const [bots, setBots] = useState<Bots>({ piscinas: false, vivero: false });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/bot-config")
      .then((r) => r.json())
      .then((d) => setBots({ piscinas: !!d.piscinas, vivero: !!d.vivero }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = async (negocio: keyof Bots) => {
    const next = !bots[negocio];
    setBots((b) => ({ ...b, [negocio]: next }));
    await fetch("/api/bot-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ negocio, enabled: next }),
    }).catch(() => {});
  };

  const anyOn = bots.piscinas || bots.vivero;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted transition-colors hover:bg-hover hover:text-fg"
        title="Respuesta automática (bot)"
      >
        <Bot className="h-4 w-4" />
        {anyOn && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-60 rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="mb-1 text-xs font-medium text-faint">Respuesta automática</div>
          <p className="mb-3 text-[11px] text-faint">
            Cuando está ON, el bot responde las consultas con la respuesta sugerida por IA.
          </p>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-fg">Piscinas</span>
            <Switch on={bots.piscinas} onClick={() => toggle("piscinas")} />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-fg">Vivero</span>
            <Switch on={bots.vivero} onClick={() => toggle("vivero")} />
          </div>
        </div>
      )}
    </div>
  );
}
