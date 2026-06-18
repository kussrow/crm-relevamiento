"use client";

import { useState, useTransition } from "react";
import { setNotasAction } from "@/app/(dash)/lead/[id]/actions";

export default function NotasEditor({
  id,
  initial,
}: {
  id: number;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = value !== initial;

  const save = () => {
    startTransition(async () => {
      await setNotasAction(id, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Notas de seguimiento, observaciones, próximos pasos…"
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700 outline-none focus:border-zinc-400"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {pending ? "Guardando…" : "Guardar notas"}
        </button>
        {saved && <span className="text-sm text-emerald-600">✓ Guardado</span>}
      </div>
    </div>
  );
}
