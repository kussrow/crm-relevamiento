import { NextResponse } from "next/server";
import { insertLead, type LeadInput } from "@/lib/leads";
import { getBot } from "@/lib/config";
import { sendMessage } from "@/lib/evolution";

// Normaliza el payload aceptando tanto los nombres del CRM como los
// que produce el nodo "Parsear Resultado" de n8n (piscinas y vivero).
function normalize(b: Record<string, unknown>): LeadInput {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = b[k];
      if (v !== undefined && v !== null && v !== "") return v as string;
    }
    return undefined;
  };
  return {
    negocio: pick("negocio", "cuenta"),
    fecha_mensaje: pick("fecha_mensaje", "timestamp"),
    nombre: pick("nombre"),
    telefono: pick("telefono"),
    tipo_mensaje: pick("tipo_mensaje"),
    mensaje: pick("mensaje", "mensaje_original"),
    categoria: pick("categoria"),
    subcategoria: pick("subcategoria"),
    producto: pick("producto", "producto_consultado"),
    detalle: pick("detalle", "modelo_o_medida", "especie_o_variedad"),
    ciudad: pick("ciudad"),
    provincia: pick("provincia"),
    intencion: pick("intencion", "intencion_compra"),
    urgencia: pick("urgencia"),
    requiere_humano: (b.requiere_humano as boolean | string) ?? false,
    resumen: pick("resumen", "resumen_consulta"),
    pregunta: pick("pregunta", "pregunta_principal"),
    forma_pago: pick("forma_pago"),
    precio: pick("precio", "precio_mencionado"),
    cantidad: pick("cantidad"),
    problema: pick("problema", "problema_reportado"),
    respuesta_sugerida: pick("respuesta_sugerida", "respuesta_futura_chatbot"),
    etiquetas: pick("etiquetas"),
    raw: b,
  };
}

export async function POST(request: Request) {
  const token = request.headers.get("x-ingest-token");
  if (!process.env.INGEST_TOKEN || token !== process.env.INGEST_TOKEN) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const data = normalize(body);
    const id = await insertLead(data);

    // Bot automático: si está activo para ese negocio, responde por WhatsApp.
    try {
      if (
        data.negocio &&
        data.telefono &&
        data.respuesta_sugerida &&
        (await getBot(data.negocio))
      ) {
        const reply = `${data.respuesta_sugerida}\n\n— Respuesta automática. Un asesor te contacta a la brevedad.`;
        await sendMessage(data.negocio, data.telefono, reply);
      }
    } catch (e) {
      console.error("[crm] error en respuesta automática:", e);
    }

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    console.error("[crm] error insertando lead:", e);
    return NextResponse.json({ error: "error al insertar" }, { status: 500 });
  }
}
