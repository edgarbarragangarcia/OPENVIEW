-- ============================================================
-- OPENVIEW LMS — Feedback de temas por lección (Kanban)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.topic_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
