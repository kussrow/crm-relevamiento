"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

// Set acotado de emojis frecuentes (sin librerías externas).
const EMOJIS = [
  "😀", "😃", "😄", "😁", "😉", "😊", "😍", "😘", "😎", "🤗",
  "🤔", "😅", "😂", "🙃", "😇", "🥳", "😢", "😭", "😡", "😴",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👌", "✌️", "🤝", "👋",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🔥", "⭐", "✨", "🎉",
  "✅", "❌", "⚠️", "❓", "❗", "📌", "📎", "📝", "📄", "📅",
  "📍", "🏠", "🚚", "📦", "💰", "💵", "💲", "🏷️", "🛒", "🤑",
  "📞", "📱", "💬", "📧", "🕐", "⏰", "👉", "👈", "➡️", "💯",
  "🏊", "🌊", "💧", "☀️", "🌱", "🌿", "🌳", "🌸", "🌷", "🪴",
];

export default function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Emojis"
        className="rounded-md border border-border p-2 text-muted hover:bg-hover hover:text-fg"
      >
        <Smile className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onSelect(e);
                  setOpen(false);
                }}
                className="rounded p-1 text-lg leading-none hover:bg-hover"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
