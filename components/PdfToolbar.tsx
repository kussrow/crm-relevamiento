"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

// Barra visible solo en pantalla (se oculta al imprimir mediante .no-print).
export default function PdfToolbar({ volverHref }: { volverHref: string }) {
  return (
    <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between">
      <Link
        href={volverHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
      >
        <Printer className="h-4 w-4" /> Descargar PDF
      </button>
    </div>
  );
}
