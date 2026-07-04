-- ============================================================
-- OpenView LMS — Script Unificado Final
-- Ejecuta todo esto en el SQL Editor de Supabase
-- ============================================================

-- 1. LIMPIAR TODO (tablas en orden para evitar errores de FK)
DROP TABLE IF EXISTS public.progress      CASCADE;
DROP TABLE IF EXISTS public.enrollments   CASCADE;
DROP TABLE IF EXISTS public.lessons       CASCADE;
DROP TABLE IF EXISTS public.modules       CASCADE;
DROP TABLE IF EXISTS public.courses       CASCADE;
DROP TABLE IF EXISTS public.categories    CASCADE;
DROP TABLE IF EXISTS public.profiles      CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()        CASCADE;

-- 2. FUNCIÓN AUXILIAR: comprueba si el usuario actual es admin
--    SECURITY DEFINER evita la recursión infinita de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. PROFILES
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','student','instructor')),
  bio         TEXT,
  last_seen   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve/edita su propio perfil
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Admin ve todos los perfiles
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL   USING (public.is_admin());

-- 4. TRIGGER: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RECUPERAR USUARIOS EXISTENTES
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  'student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. PROMOVER AL ADMIN (ajusta el email si es diferente)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@openview.com');

-- 7. CATEGORIES
CREATE TABLE public.categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE,
  icon  TEXT
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_read"       ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL   USING (public.is_admin());

INSERT INTO public.categories (name, slug, icon) VALUES
  ('Inteligencia Artificial', 'ia',          '🤖'),
  ('Liderazgo',               'liderazgo',   '🎯'),
  ('Tecnología',              'tecnologia',  '💻'),
  ('Negocios',                'negocios',    '📈'),
  ('Marketing Digital',       'marketing',   '📣'),
  ('Diseño',                  'diseno',      '🎨'),
  ('Productividad',           'productividad','⚡')
ON CONFLICT DO NOTHING;

-- 8. COURSES
CREATE TABLE public.courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  long_desc     TEXT,
  cover_url     TEXT,
  price         NUMERIC(10,2) DEFAULT 0,
  category_id   INT REFERENCES public.categories(id),
  level         TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  duration_hrs  NUMERIC(5,1) DEFAULT 0,
  published     BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- Visitantes ven solo publicados
CREATE POLICY "courses_read_published" ON public.courses FOR SELECT USING (published = true);
-- Admin lo ve y gestiona todo (política separada de la de SELECT público)
CREATE POLICY "courses_admin_all"      ON public.courses FOR ALL   USING (public.is_admin());

-- 9. MODULES
CREATE TABLE public.modules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  position   INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_read_published" ON public.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true)
);
CREATE POLICY "modules_admin_all" ON public.modules FOR ALL USING (public.is_admin());

-- 10. LESSONS
CREATE TABLE public.lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT,
  video_url     TEXT,
  pdf_url       TEXT,
  duration_min  INT  DEFAULT 0,
  position      INT  NOT NULL DEFAULT 0,
  is_free       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_free_read"  ON public.lessons FOR SELECT USING (is_free = true);
CREATE POLICY "lessons_enrolled_read" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.modules m ON m.id = module_id
    WHERE e.user_id = auth.uid() AND e.course_id = m.course_id
  )
);
CREATE POLICY "lessons_admin_all" ON public.lessons FOR ALL USING (public.is_admin());

-- 11. ENROLLMENTS (matrícula: estudiante ↔ curso)
CREATE TABLE public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_own_read"   ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enrollments_own_insert" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments_own_delete" ON public.enrollments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "enrollments_admin_all"  ON public.enrollments FOR ALL   USING (public.is_admin());

-- 12. PROGRESS (progreso por lección)
CREATE TABLE public.progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own_read"   ON public.progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_own_insert" ON public.progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_own_update" ON public.progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_admin_all"  ON public.progress FOR ALL   USING (public.is_admin());

-- 13. RECARGAR API
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- ✅ Script completado. Verificar en Table Editor que existen:
--    profiles, categories, courses, modules, lessons, 
--    enrollments, progress
-- ============================================================
