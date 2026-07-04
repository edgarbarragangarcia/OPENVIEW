-- ============================================================
-- OPENVIEW LMS — Schema completo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

INSERT INTO public.categories (name, slug) VALUES
  ('Inteligencia Artificial', 'ia'),
  ('Liderazgo', 'liderazgo'),
  ('Tecnología', 'tecnologia'),
  ('Negocios', 'negocios'),
  ('Marketing Digital', 'marketing')
ON CONFLICT DO NOTHING;

-- 3. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  long_desc     TEXT,
  cover_url     TEXT,
  price         NUMERIC(10,2) DEFAULT 0,
  category_id   INT REFERENCES public.categories(id),
  level         TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hrs  NUMERIC(5,1) DEFAULT 0,
  published     BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT,
  video_url    TEXT,
  duration_min INT DEFAULT 0,
  position     INT NOT NULL DEFAULT 0,
  is_free      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 6. ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 7. PROGRESS
CREATE TABLE IF NOT EXISTS public.progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- CATEGORIES (todos leen)
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- COURSES (publicados = todos leen; admin = todo)
CREATE POLICY "courses_read_published" ON public.courses FOR SELECT USING (published = true);
CREATE POLICY "courses_admin_all"      ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- MODULES
CREATE POLICY "modules_read_enrolled" ON public.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true)
);
CREATE POLICY "modules_admin_all" ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- LESSONS
CREATE POLICY "lessons_read_enrolled" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.published = true
  )
);
CREATE POLICY "lessons_admin_all" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ENROLLMENTS
CREATE POLICY "enrollments_own"      ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enrollments_insert"   ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments_delete"   ON public.enrollments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "enrollments_admin_all" ON public.enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PROGRESS
CREATE POLICY "progress_own"       ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert"    ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update"    ON public.progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_admin_all" ON public.progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- ASIGNAR ROL ADMIN al primer usuario (cambiar el email)
-- Ejecutar DESPUÉS de que el usuario se haya registrado:
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@openview.com');
-- ============================================================
