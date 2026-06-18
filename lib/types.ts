export type Negocio = "piscinas" | "vivero";
export type Nivel = "baja" | "media" | "alta";
export type Temperatura = "caliente" | "tibio" | "frio";
export type Estado =
  | "nuevo"
  | "contactado"
  | "presupuesto"
  | "ganado"
  | "perdido";

export interface Lead {
  id: number;
  negocio: Negocio;
  fecha_mensaje: string | null;
  nombre: string | null;
  telefono: string | null;
  tipo_mensaje: string | null;
  mensaje: string | null;
  categoria: string | null;
  subcategoria: string | null;
  producto: string | null;
  detalle: string | null;
  ciudad: string | null;
  provincia: string | null;
  intencion: Nivel | null;
  urgencia: Nivel | null;
  requiere_humano: boolean;
  resumen: string | null;
  pregunta: string | null;
  forma_pago: string | null;
  precio: string | null;
  cantidad: string | null;
  problema: string | null;
  respuesta_sugerida: string | null;
  etiquetas: string | null;
  estado: Estado;
  notas: string | null;
  created_at: string;
  updated_at: string;
  score: number;
  temperatura: Temperatura;
}

export const ESTADOS: Estado[] = [
  "nuevo",
  "contactado",
  "presupuesto",
  "ganado",
  "perdido",
];
