-- ============================================================
-- OpenView LMS — Canvas de Procesos SPEC (Karpathy)
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================================

-- ─── 1. TABLA: process_canvases ─────────────────────────────
-- Almacena los canvases creados por cada usuario

CREATE TABLE IF NOT EXISTS public.process_canvases (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  course_id   UUID,                          -- opcional: ligar el canvas a un curso
  name        TEXT        NOT NULL DEFAULT 'Mi Canvas de Procesos',
  description TEXT,
  zoom        NUMERIC     DEFAULT 0.75,
  pan_x       NUMERIC     DEFAULT 40,
  pan_y       NUMERIC     DEFAULT 20,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT process_canvases_pkey    PRIMARY KEY (id),
  CONSTRAINT process_canvases_user_fk FOREIGN KEY (user_id)   REFERENCES public.profiles(id)  ON DELETE CASCADE,
  CONSTRAINT process_canvases_course_fk FOREIGN KEY (course_id) REFERENCES public.courses(id)  ON DELETE SET NULL
);

-- ─── 2. TABLA: canvas_nodes ─────────────────────────────────
-- Almacena cada nodo/bloque del canvas con su SPEC completo

CREATE TABLE IF NOT EXISTS public.canvas_nodes (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  canvas_id   UUID        NOT NULL,
  node_key    TEXT        NOT NULL,           -- ID local del nodo (string corto)
  type        TEXT        NOT NULL DEFAULT 'process'
                          CHECK (type IN ('process','decision','start','end','document','database','action','note')),
  title       TEXT        NOT NULL DEFAULT '',
  color       TEXT        NOT NULL DEFAULT '#3b82f6',
  pos_x       NUMERIC     NOT NULL DEFAULT 100,
  pos_y       NUMERIC     NOT NULL DEFAULT 100,

  -- Formato SPEC de Karpathy
  spec_objective  TEXT        DEFAULT '',
  spec_inputs     TEXT[]      DEFAULT '{}',
  spec_steps      TEXT[]      DEFAULT '{}',
  spec_outputs    TEXT[]      DEFAULT '{}',
  spec_success    TEXT[]      DEFAULT '{}',
  spec_failures   TEXT[]      DEFAULT '{}',

  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT canvas_nodes_pkey      PRIMARY KEY (id),
  CONSTRAINT canvas_nodes_canvas_fk FOREIGN KEY (canvas_id) REFERENCES public.process_canvases(id) ON DELETE CASCADE
);

-- ─── 3. TABLA: canvas_connections ───────────────────────────
-- Almacena las flechas/conexiones entre nodos

CREATE TABLE IF NOT EXISTS public.canvas_connections (
  id           UUID    NOT NULL DEFAULT gen_random_uuid(),
  canvas_id    UUID    NOT NULL,
  conn_key     TEXT    NOT NULL,              -- ID local de la conexión
  from_node    TEXT    NOT NULL,              -- node_key del nodo origen
  to_node      TEXT    NOT NULL,              -- node_key del nodo destino
  label        TEXT    DEFAULT '',

  created_at   TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT canvas_connections_pkey      PRIMARY KEY (id),
  CONSTRAINT canvas_connections_canvas_fk FOREIGN KEY (canvas_id) REFERENCES public.process_canvases(id) ON DELETE CASCADE
);

-- ─── 4. ÍNDICES ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_process_canvases_user   ON public.process_canvases (user_id);
CREATE INDEX IF NOT EXISTS idx_process_canvases_course ON public.process_canvases (course_id);
CREATE INDEX IF NOT EXISTS idx_canvas_nodes_canvas     ON public.canvas_nodes (canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_connections_canvas ON public.canvas_connections (canvas_id);

-- ─── 5. TRIGGER: updated_at automático ──────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_canvas_updated_at       ON public.process_canvases;
DROP TRIGGER IF EXISTS trg_canvas_nodes_updated_at ON public.canvas_nodes;

CREATE TRIGGER trg_canvas_updated_at
  BEFORE UPDATE ON public.process_canvases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_canvas_nodes_updated_at
  BEFORE UPDATE ON public.canvas_nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 6. ROW LEVEL SECURITY ───────────────────────────────────

ALTER TABLE public.process_canvases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_nodes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_connections ENABLE ROW LEVEL SECURITY;

-- process_canvases: cada usuario gestiona los suyos; admin ve todos
CREATE POLICY "canvas_self_select" ON public.process_canvases
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "canvas_self_insert" ON public.process_canvases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "canvas_self_update" ON public.process_canvases
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "canvas_self_delete" ON public.process_canvases
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- canvas_nodes: acceso via canvas del usuario
CREATE POLICY "canvas_nodes_select" ON public.canvas_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "canvas_nodes_insert" ON public.canvas_nodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "canvas_nodes_update" ON public.canvas_nodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "canvas_nodes_delete" ON public.canvas_nodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- canvas_connections: mismo patrón
CREATE POLICY "canvas_conn_select" ON public.canvas_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "canvas_conn_insert" ON public.canvas_connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "canvas_conn_update" ON public.canvas_connections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "canvas_conn_delete" ON public.canvas_connections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.process_canvases c
      WHERE c.id = canvas_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ─── 7. VERIFICACIÓN ─────────────────────────────────────────
-- Ejecuta esto para confirmar que las tablas se crearon:

SELECT table_name, obj_description(pgc.oid) AS comment
FROM information_schema.tables t
JOIN pg_class pgc ON pgc.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('process_canvases', 'canvas_nodes', 'canvas_connections')
ORDER BY table_name;
