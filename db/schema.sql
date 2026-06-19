-- Esquema del CRM de relevamiento WhatsApp (piscinas + vivero)
CREATE TABLE IF NOT EXISTS leads (
  id                 BIGSERIAL PRIMARY KEY,
  negocio            TEXT NOT NULL,                     -- 'piscinas' | 'vivero' (viene de cuenta/instancia)
  fecha_mensaje      TIMESTAMPTZ,                       -- fecha del mensaje original
  nombre             TEXT,
  telefono           TEXT,
  tipo_mensaje       TEXT,                              -- texto | audio | imagen
  mensaje            TEXT,                              -- mensaje_original / transcripción / descripción
  categoria          TEXT,
  subcategoria       TEXT,
  producto           TEXT,                              -- producto_consultado
  detalle            TEXT,                              -- modelo_o_medida (piscinas) / especie_o_variedad (vivero)
  ciudad             TEXT,
  provincia          TEXT,
  intencion          TEXT,                              -- baja | media | alta
  urgencia           TEXT,                              -- baja | media | alta
  requiere_humano    BOOLEAN DEFAULT false,
  resumen            TEXT,
  pregunta           TEXT,
  forma_pago         TEXT,
  precio             TEXT,
  cantidad           TEXT,
  problema           TEXT,
  respuesta_sugerida TEXT,
  etiquetas          TEXT,
  -- Campos del CRM (editables por el usuario)
  estado             TEXT NOT NULL DEFAULT 'nuevo',     -- nuevo | contactado | presupuesto | ganado | perdido
  notas              TEXT,
  raw                JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Scoring automático (calculado a partir de intención + urgencia + requiere_humano)
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

CREATE INDEX IF NOT EXISTS idx_leads_negocio    ON leads (negocio);
CREATE INDEX IF NOT EXISTS idx_leads_estado     ON leads (estado);
CREATE INDEX IF NOT EXISTS idx_leads_categoria  ON leads (categoria);
CREATE INDEX IF NOT EXISTS idx_leads_fecha      ON leads (fecha_mensaje DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score      ON leads (score DESC);

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
