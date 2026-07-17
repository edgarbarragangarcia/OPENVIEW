import { supabase } from './supabase';

/** Save one attempt of the current user's quiz for a lesson. Every attempt is kept (not just the best). */
export async function saveQuizResult(lessonId: string, score: number, total: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('quiz_results')
    .insert({ user_id: user.id, lesson_id: lessonId, score, total });
  if (error) throw error;
}

export interface AdminQuizResult {
  id: string;
  score: number;
  total: number;
  created_at: string;
  lesson_id: string;
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
  lessons: { title: string; modules: { title: string; courses: { id: string; title: string } | null } | null } | null;
}

/** [ADMIN] Todos los intentos de evaluación de todos los estudiantes, más recientes primero */
export async function getAllQuizResults(): Promise<AdminQuizResult[]> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('id, score, total, created_at, lesson_id, user_id, profiles(full_name, email), lessons(title, modules(title, courses(id, title)))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as AdminQuizResult[]) ?? [];
}
