-- ============================================================
-- OPENVIEW LMS — Feedback de temas por lección (Kanban)
-- Ejecutar en Supabase SQL Editor
--
-- NOTA: esta versión corrige el FK de user_id para que apunte a
-- public.profiles(id) (igual que enrollments/progress en tu esquema
-- real), en vez de auth.users(id) — así PostgREST puede hacer el
-- join `profiles(...)` que usa la vista de admin. Si ya habías
-- ejecutado una versión anterior de este archivo, el DROP la
-- reemplaza (no debería haber feedback real todavía).
-- ============================================================

DROP TABLE IF EXISTS public.topic_feedback CASCADE;

CREATE TABLE public.topic_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  topic_index   INT NOT NULL,
  topic_text    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'understood', 'not_understood')),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id, topic_index)
);

ALTER TABLE public.topic_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topic_feedback_own_select" ON public.topic_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "topic_feedback_own_insert" ON public.topic_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "topic_feedback_own_update" ON public.topic_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "topic_feedback_admin_all"  ON public.topic_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
