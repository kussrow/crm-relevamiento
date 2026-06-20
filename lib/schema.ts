// Esquema como string para la auto-migración al arrancar (idempotente).
// Mantener en sync con db/schema.sql (usado por el Postgres de desarrollo).
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS leads (
  id                 BIGSERIAL PRIMARY KEY,
  negocio            TEXT NOT NULL,
  fecha_mensaje      TIMESTAMPTZ,
  nombre             TEXT,
  telefono           TEXT,
  tipo_mensaje       TEXT,
  mensaje            TEXT,
  categoria          TEXT,
  subcategoria       TEXT,
  producto           TEXT,
  detalle            TEXT,
  ciudad             TEXT,
  provincia          TEXT,
  intencion          TEXT,
  urgencia           TEXT,
  requiere_humano    BOOLEAN DEFAULT false,
  resumen            TEXT,
  pregunta           TEXT,
  forma_pago         TEXT,
  precio             TEXT,
  cantidad           TEXT,
  problema           TEXT,
  respuesta_sugerida TEXT,
  etiquetas          TEXT,
  estado             TEXT NOT NULL DEFAULT 'nuevo',
  notas              TEXT,
  raw                JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  score INT GENERATED ALWAYS AS (
    (CASE intencion WHEN 'alta' THEN 3 WHEN 'media' THEN 2 WHEN 'baja' THEN 1 ELSE 0 END) * 10
    + (CASE urgencia WHEN 'alta' THEN 3 WHEN 'media' THEN 2 WHEN 'baja' THEN 1 ELSE 0 END) * 3
    + (CASE WHEN requiere_humano THEN 2 ELSE 0 END)
  ) STORED,
  temperatura TEXT GENERATED ALWAYS AS (
    CASE
      WHEN intencion = 'alta' THEN 'caliente'
      WHEN intencion = 'media' THEN 'tibio'
      ELSE 'frio'
    END
  ) STORED
);
-- Datos cargados manualmente desde el CRM (separados de la clasificación IA).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS datos_personales  JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS datos_facturacion JSONB;

CREATE INDEX IF NOT EXISTS idx_leads_negocio   ON leads (negocio);
CREATE INDEX IF NOT EXISTS idx_leads_estado    ON leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_categoria ON leads (categoria);
CREATE INDEX IF NOT EXISTS idx_leads_fecha     ON leads (fecha_mensaje DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score     ON leads (score DESC);

CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS presupuestos (
  id         BIGSERIAL PRIMARY KEY,
  negocio    TEXT,
  cliente    TEXT,
  telefono   TEXT,
  lead_id    BIGINT,
  estado     TEXT NOT NULL DEFAULT 'borrador',
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  notas      TEXT,
  total      NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS vence_el DATE;
-- Moneda del presupuesto (ARS | USD) y cotización del dólar usada (pesos por USD).
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS moneda TEXT NOT NULL DEFAULT 'ARS';
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS cotizacion NUMERIC;

CREATE TABLE IF NOT EXISTS eventos (
  id         BIGSERIAL PRIMARY KEY,
  tipo       TEXT NOT NULL DEFAULT 'otro',   -- visita | reunion | llamada | seguimiento | otro
  titulo     TEXT NOT NULL,
  fecha      TIMESTAMPTZ NOT NULL,
  lead_id    BIGINT,
  cliente    TEXT,
  telefono   TEXT,
  notas      TEXT,
  hecho      BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha);
-- Rubro del evento (piscinas | vivero) para aislar la agenda por usuario.
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS negocio TEXT;

-- Catálogo de productos sincronizado desde Dux Software.
CREATE TABLE IF NOT EXISTS productos_dux (
  cod_item    TEXT PRIMARY KEY,
  descripcion TEXT,
  costo       NUMERIC,
  porc_iva    NUMERIC,
  precios     JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock       NUMERIC,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_productos_dux_desc ON productos_dux (lower(descripcion));

-- Respuestas frecuentes reutilizables en el chat (separadas por rubro).
CREATE TABLE IF NOT EXISTS respuestas (
  id         BIGSERIAL PRIMARY KEY,
  negocio    TEXT,
  titulo     TEXT NOT NULL,
  texto      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_respuestas_negocio ON respuestas (negocio);
-- Adjunto opcional (imagen/PDF/etc.) guardado en la propia base.
ALTER TABLE respuestas ADD COLUMN IF NOT EXISTS adjunto_nombre TEXT;
ALTER TABLE respuestas ADD COLUMN IF NOT EXISTS adjunto_mime   TEXT;
ALTER TABLE respuestas ADD COLUMN IF NOT EXISTS adjunto_datos  BYTEA;
`;
