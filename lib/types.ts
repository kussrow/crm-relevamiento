export type Negocio = "piscinas" | "vivero";
export type Nivel = "baja" | "media" | "alta";
export type Temperatura = "caliente" | "tibio" | "frio";
export type Estado =
  | "nuevo"
  | "contactado"
  | "presupuesto"
  | "ganado"
  | "perdido";

// Datos cargados a mano desde el CRM, separados de la clasificación IA.
export interface DatosPersonales {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
}

export type CondicionIVA =
  | "Responsable Inscripto"
  | "Monotributo"
  | "Consumidor Final"
  | "Exento";

export const CONDICIONES_IVA: CondicionIVA[] = [
  "Responsable Inscripto",
  "Monotributo",
  "Consumidor Final",
  "Exento",
];

export interface DatosFacturacion {
  razon_social?: string;
  cuit?: string;
  condicion_iva?: CondicionIVA | "";
  domicilio_fiscal?: string;
  email_facturacion?: string;
}

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
  datos_personales: DatosPersonales | null;
  datos_facturacion: DatosFacturacion | null;
  created_at: string;
  updated_at: string;
  score: number;
  temperatura: Temperatura;
}

// Lead representante de un cliente (agrupado por teléfono) + agregados.
export interface ClienteLead extends Lead {
  ckey: string;
  consultas: number;
  any_humano: boolean;
  max_score: number;
}

export const ESTADOS: Estado[] = [
  "nuevo",
  "contactado",
  "presupuesto",
  "ganado",
  "perdido",
];

export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "rechazado";
export const ESTADOS_PRESUPUESTO: EstadoPresupuesto[] = [
  "borrador",
  "enviado",
  "aceptado",
  "rechazado",
];

export interface PresupuestoItem {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface Presupuesto {
  id: number;
  negocio: string | null;
  cliente: string | null;
  telefono: string | null;
  lead_id: number | null;
  estado: EstadoPresupuesto;
  items: PresupuestoItem[];
  notas: string | null;
  total: number;
  vence_el: string | null;
  created_at: string;
  updated_at: string;
}

// Agenda / calendario
export type TipoEvento = "visita" | "reunion" | "llamada" | "seguimiento" | "otro";
export const TIPOS_EVENTO: TipoEvento[] = [
  "visita",
  "reunion",
  "llamada",
  "seguimiento",
  "otro",
];

export interface Evento {
  id: number;
  tipo: TipoEvento;
  titulo: string;
  fecha: string; // ISO timestamptz
  lead_id: number | null;
  cliente: string | null;
  telefono: string | null;
  notas: string | null;
  hecho: boolean;
  created_at: string;
  updated_at: string;
}
