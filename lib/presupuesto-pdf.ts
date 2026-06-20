import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { EMPRESA } from "./empresa";
import { formatMoneda } from "./format";
import type { Presupuesto } from "./types";

// Colores (equivalentes a los del PDF HTML)
const AZUL = rgb(0.145, 0.388, 0.922); // #2563eb
const BLANCO = rgb(1, 1, 1);
const TXT = rgb(0.09, 0.09, 0.11);
const GRIS = rgb(0.44, 0.44, 0.48);
const GRIS_CLARO = rgb(0.6, 0.6, 0.64);
const FONDO_SUAVE = rgb(0.97, 0.98, 0.99);
const BORDE = rgb(0.89, 0.9, 0.92);

const A4 = { w: 595.28, h: 841.89 };
const MARGEN = 48;
const RIGHT = A4.w - MARGEN;

// pdf-lib usa StandardFonts con codificación WinAnsi: dejamos solo caracteres
// representables (Latin-1 + puntuación tipográfica), el resto se descarta.
const WINANSI_EXTRA = new Set([
  "–", "—", "‘", "’", "“", "”", "•",
  "…", "€", "™", "†", "‡", "‰", "Œ",
  "œ", "Š", "š", "Ÿ", "Ž", "ž", "ƒ",
]);

function sanitize(s: string | null | undefined): string {
  if (!s) return "";
  let out = "";
  for (const ch of s) {
    if (ch === "\n") {
      out += "\n";
      continue;
    }
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff)) out += ch;
    else if (WINANSI_EXTRA.has(ch)) out += ch;
    else if (cp < 0x20) out += " ";
    // resto (emoji, etc.): se omite
  }
  return out;
}

// Parte un texto en líneas que no superen maxWidth (respeta saltos de línea).
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const parrafo of sanitize(text).split("\n")) {
    const palabras = parrafo.split(/\s+/).filter(Boolean);
    let actual = "";
    for (const palabra of palabras) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (font.widthOfTextAtSize(prueba, size) > maxWidth && actual) {
        lines.push(actual);
        actual = palabra;
      } else {
        actual = prueba;
      }
    }
    lines.push(actual);
  }
  return lines;
}

export async function generarPresupuestoPdf(p: Presupuesto): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Presupuesto ${p.id} - ${EMPRESA.nombre}`);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h;

  const txt = (
    s: string,
    x: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = TXT
  ) => page.drawText(sanitize(s), { x, y: yy, size, font: f, color });

  const txtRight = (
    s: string,
    xRight: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = TXT
  ) => {
    const clean = sanitize(s);
    const w = f.widthOfTextAtSize(clean, size);
    page.drawText(clean, { x: xRight - w, y: yy, size, font: f, color });
  };

  // Barra superior de color
  page.drawRectangle({ x: 0, y: A4.h - 8, width: A4.w, height: 8, color: AZUL });

  // ===== Encabezado: empresa (izq) + sello PRESUPUESTO (der) =====
  y = A4.h - 56;
  txt(EMPRESA.nombre, MARGEN, y, 20, bold, AZUL);
  let yd = y - 16;
  for (const linea of [
    EMPRESA.direccion,
    `WhatsApp ${EMPRESA.whatsapp} · ${EMPRESA.email}`,
    `CUIT: ${EMPRESA.cuit}`,
  ]) {
    txt(linea, MARGEN, yd, 8, font, GRIS);
    yd -= 11;
  }

  // Sello "PRESUPUESTO"
  const selloTxt = "PRESUPUESTO";
  const selloW = bold.widthOfTextAtSize(selloTxt, 11) + 24;
  page.drawRectangle({
    x: RIGHT - selloW,
    y: y - 4,
    width: selloW,
    height: 24,
    color: AZUL,
  });
  txt(selloTxt, RIGHT - selloW + 12, y + 3, 11, bold, BLANCO);
  txtRight(`N.º ${p.id}`, RIGHT, y - 24, 10, font, GRIS);
  txtRight(fechaCorta(p.created_at), RIGHT, y - 38, 9, font, GRIS);
  if (p.vence_el) {
    txtRight(
      `Válido hasta: ${p.vence_el.split("-").reverse().join("/")}`,
      RIGHT,
      y - 51,
      9,
      bold,
      rgb(0.3, 0.3, 0.34)
    );
  }

  // Línea separadora
  y = yd - 10;
  page.drawRectangle({ x: MARGEN, y, width: RIGHT - MARGEN, height: 1.5, color: AZUL });

  // ===== Cliente =====
  y -= 18;
  const cajaH = 44;
  page.drawRectangle({
    x: MARGEN,
    y: y - cajaH,
    width: (RIGHT - MARGEN) * 0.62,
    height: cajaH,
    color: FONDO_SUAVE,
  });
  txt("CLIENTE", MARGEN + 12, y - 16, 8, bold, GRIS_CLARO);
  txt(p.cliente || "—", MARGEN + 12, y - 30, 12, bold, rgb(0.16, 0.16, 0.2));
  if (p.telefono) txt(`Tel: ${p.telefono}`, MARGEN + 12, y - 42, 9, font, GRIS);
  y -= cajaH + 22;

  // ===== Tabla de ítems =====
  const items = (p.items || []).filter((i) => i.descripcion);
  const colSubR = RIGHT;
  const colPreR = colSubR - 95;
  const colCantR = colPreR - 70;
  const descX = MARGEN + 8;
  const descMaxW = colCantR - 45 - descX;

  // Encabezado de la tabla
  const headH = 22;
  page.drawRectangle({
    x: MARGEN,
    y: y - headH,
    width: RIGHT - MARGEN,
    height: headH,
    color: AZUL,
  });
  const headBaseline = y - 15;
  txt("Descripción", descX, headBaseline, 9, bold, BLANCO);
  txtRight("Cant.", colCantR, headBaseline, 9, bold, BLANCO);
  txtRight("Precio unit.", colPreR, headBaseline, 9, bold, BLANCO);
  txtRight("Subtotal", colSubR, headBaseline, 9, bold, BLANCO);
  y -= headH;

  const nuevaPaginaSiHaceFalta = (necesita: number) => {
    if (y - necesita < 80) {
      page = doc.addPage([A4.w, A4.h]);
      page.drawRectangle({ x: 0, y: A4.h - 8, width: A4.w, height: 8, color: AZUL });
      y = A4.h - 40;
    }
  };

  if (items.length === 0) {
    txt("Sin ítems cargados.", descX, y - 16, 10, font, GRIS_CLARO);
    y -= 28;
  }

  items.forEach((it, idx) => {
    const lineas = wrap(it.descripcion, font, 9, descMaxW);
    const rowH = Math.max(lineas.length * 12 + 8, 22);
    nuevaPaginaSiHaceFalta(rowH);

    if (idx % 2 === 1) {
      page.drawRectangle({
        x: MARGEN,
        y: y - rowH,
        width: RIGHT - MARGEN,
        height: rowH,
        color: FONDO_SUAVE,
      });
    }

    let ly = y - 15;
    for (const linea of lineas) {
      txt(linea, descX, ly, 9, font, TXT);
      ly -= 12;
    }
    const baseline = y - 15;
    const sub = (Number(it.cantidad) || 0) * (Number(it.precio) || 0);
    txtRight(String(it.cantidad), colCantR, baseline, 9, font, TXT);
    txtRight(formatMoneda(it.precio), colPreR, baseline, 9, font, TXT);
    txtRight(formatMoneda(sub), colSubR, baseline, 9, bold, TXT);

    // borde inferior
    page.drawRectangle({ x: MARGEN, y: y - rowH, width: RIGHT - MARGEN, height: 0.5, color: BORDE });
    y -= rowH;
  });

  // ===== Total =====
  y -= 16;
  nuevaPaginaSiHaceFalta(48);
  const totalW = 220;
  const totalH = 34;
  const totalX = RIGHT - totalW;
  page.drawRectangle({
    x: totalX,
    y: y - totalH,
    width: totalW,
    height: totalH,
    color: rgb(0.93, 0.95, 0.99),
    borderColor: rgb(0.78, 0.84, 0.97),
    borderWidth: 1,
  });
  txt("TOTAL", totalX + 14, y - 22, 11, bold, rgb(0.35, 0.35, 0.4));
  txtRight(formatMoneda(p.total), RIGHT - 14, y - 24, 18, bold, AZUL);
  y -= totalH + 24;

  // ===== Notas / condiciones =====
  if (p.notas && p.notas.trim()) {
    const lineas = wrap(p.notas, font, 9, RIGHT - MARGEN - 24);
    const cajaNotasH = lineas.length * 12 + 34;
    nuevaPaginaSiHaceFalta(cajaNotasH);
    page.drawRectangle({
      x: MARGEN,
      y: y - cajaNotasH,
      width: RIGHT - MARGEN,
      height: cajaNotasH,
      borderColor: BORDE,
      borderWidth: 1,
    });
    txt("NOTAS Y CONDICIONES", MARGEN + 12, y - 16, 8, bold, GRIS_CLARO);
    let ny = y - 30;
    for (const linea of lineas) {
      txt(linea, MARGEN + 12, ny, 9, font, GRIS);
      ny -= 12;
    }
    y -= cajaNotasH + 20;
  }

  // ===== Pie =====
  const pie = `Gracias por su consulta · ${EMPRESA.nombre} · ${EMPRESA.email} · WhatsApp ${EMPRESA.whatsapp}`;
  const pieClean = sanitize(pie);
  const pieW = font.widthOfTextAtSize(pieClean, 8);
  page.drawText(pieClean, {
    x: (A4.w - pieW) / 2,
    y: 36,
    size: 8,
    font,
    color: GRIS_CLARO,
  });

  return doc.save();
}

function fechaCorta(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
