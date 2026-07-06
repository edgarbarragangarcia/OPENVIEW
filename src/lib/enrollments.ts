import { supabase } from './supabase';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  // Joined
  profiles?: { full_name: string; email: string; avatar_url: string | null };
  courses?: { title: string; cover_url: string | null };
}

/** Matricular al usuario actual en un curso */
export async function enrollInCourse(courseId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId })
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
      profiles(full_name, avatar_url),
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

/** Calcular el progreso de un estudiante en un curso (0-100) */
export async function getCourseProgress(userId: string, courseId: string): Promise<number> {
  // Contar lecciones totales del curso
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('id', { count: 'exact' })
    .in('module_id', supabase.from('modules').select('id').eq('course_id', courseId) as any);

  if (!totalLessons || totalLessons === 0) return 0;

  // Contar lecciones completadas por el usuario
  const { count: completedLessons } = await supabase
    .from('progress')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('completed', true)
    .in('lesson_id', 
      supabase
        .from('lessons')
        .select('id')
        .in('module_id', supabase.from('modules').select('id').eq('course_id', courseId) as any) as any
    );

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

/** Obtener IDs de lecciones completadas por el usuario en un curso */
export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('completed', true)
    .in('lesson_id',
      supabase
        .from('lessons')
        .select('id')
        .in('module_id', supabase.from('modules').select('id').eq('course_id', courseId) as any) as any
    );

  return new Set((data ?? []).map(r => r.lesson_id));
}
