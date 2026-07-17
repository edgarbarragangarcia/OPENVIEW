import { supabase } from './supabase';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  access_enabled: boolean;
  // Joined
  profiles?: { full_name: string; email: string; avatar_url: string | null };
  courses?: { title: string; cover_url: string | null };
}

/** Matricular al usuario actual en un curso. Queda pendiente de aprobación del administrador
 *  (access_enabled=false) hasta que lo habilite manualmente en Matrículas. */
export async function enrollInCourse(courseId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId, access_enabled: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Verificar si el usuario actual está matriculado en un curso */
export async function isEnrolled(courseId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();
  return !!data;
}

/** Obtener todos los cursos del usuario actual (estudiante) */
export async function getMyEnrollments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(id, title, cover_url, description, duration_hrs, level, category_id, categories(name))')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** [ADMIN] Obtener todas las matrículas con detalle de usuario y curso */
export async function getAllEnrollments() {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      profiles(full_name, email, avatar_url),
      courses(title, cover_url)
    `)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data as Enrollment[];
}

/** [ADMIN] Matricular manualmente a un estudiante en un curso */
export async function adminEnrollStudent(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** [ADMIN] Eliminar una matrícula */
export async function adminRemoveEnrollment(enrollmentId: string) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);
  if (error) throw error;
}

/** [ADMIN] Habilitar/deshabilitar el acceso de una matrícula individual */
export async function adminSetEnrollmentAccess(enrollmentId: string, accessEnabled: boolean) {
  const { error } = await supabase
    .from('enrollments')
    .update({ access_enabled: accessEnabled })
    .eq('id', enrollmentId);
  if (error) throw error;
}

/** [ADMIN] Habilitar/deshabilitar el acceso de todas las matrículas de un curso */
export async function adminSetCourseAccess(courseId: string, accessEnabled: boolean) {
  const { error } = await supabase
    .from('enrollments')
    .update({ access_enabled: accessEnabled })
    .eq('course_id', courseId);
  if (error) throw error;
}

/** Verificar si el usuario actual tiene acceso habilitado a un curso (matrícula activa) */
export async function getEnrollmentAccess(courseId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from('enrollments')
    .select('access_enabled')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();
  return data?.access_enabled ?? true;
}

export async function getCourseProgress(userId: string, courseId: string): Promise<number> {
  const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
  const moduleIds = modules?.map(m => m.id) || [];
  if (moduleIds.length === 0) return 0;

  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('id', { count: 'exact' })
    .in('module_id', moduleIds);

  if (!totalLessons || totalLessons === 0) return 0;

  const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
  const lessonIds = lessons?.map(l => l.id) || [];
  if (lessonIds.length === 0) return 0;

  const { count: completedLessons } = await supabase
    .from('progress')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('completed', true)
    .in('lesson_id', lessonIds);

  return Math.round(((completedLessons ?? 0) / totalLessons) * 100);
}

/** Marcar una lección como completada */
export async function markLessonComplete(lessonId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('progress')
    .upsert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' });
  if (error) throw error;
}

/** Marcar una lección como incompleta */
export async function markLessonIncomplete(lessonId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('progress')
    .upsert({ user_id: user.id, lesson_id: lessonId, completed: false, completed_at: null },
      { onConflict: 'user_id,lesson_id' });
  if (error) throw error;
}

export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
  const moduleIds = modules?.map(m => m.id) || [];
  if (moduleIds.length === 0) return new Set();

  const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', moduleIds);
  const lessonIds = lessons?.map(l => l.id) || [];
  if (lessonIds.length === 0) return new Set();

  const { data } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('completed', true)
    .in('lesson_id', lessonIds);

  return new Set((data ?? []).map(r => r.lesson_id));
}
