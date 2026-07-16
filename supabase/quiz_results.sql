-- ============================================================
-- OPENVIEW LMS — Resultados de evaluaciones (quiz gamificado)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score      INT NOT NULL,
  total      INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_lesson ON public.quiz_results(lesson_id);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Cada estudiante ve y guarda solo sus propios intentos
CREATE POLICY "quiz_results_own_select" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quiz_results_own_insert" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admin ve y gestiona todos los intentos (para la vista de Calificaciones)
CREATE POLICY "quiz_results_admin_all" ON public.quiz_results FOR ALL USING (public.is_admin());
