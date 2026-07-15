-- Permite que cualquier usuario autenticado vea el perfil del instructor de un curso
-- (antes, RLS bloqueaba la fila y la consulta .single() en el frontend devolvía 406)
CREATE POLICY "profiles_course_instructor_select" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.created_by = profiles.id)
);
