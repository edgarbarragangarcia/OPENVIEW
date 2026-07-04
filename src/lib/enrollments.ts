import { supabase } from './supabase';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

// ── Enrollments ──────────────────────────────────────────────

export async function getMyEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*, categories(*), modules(*, lessons(*)))')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  return !!data;
}

export async function getEnrollmentsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('course_id', courseId);
  if (error) throw error;
  return data;
}

// ── Progress ─────────────────────────────────────────────────

export async function getMyProgress(userId: string, courseId?: string) {
  let query = supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId);

  if (courseId) {
    // filtrar por lecciones de este curso
    query = supabase
      .from('progress')
      .select('*, lessons!inner(module_id, modules!inner(course_id))')
      .eq('user_id', userId)
      .eq('lessons.modules.course_id', courseId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Progress[];
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markLessonIncomplete(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      { user_id: userId, lesson_id: lessonId, completed: false, completed_at: null },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Course progress % ─────────────────────────────────────────

export function calcProgress(
  lessons: { id: string }[],
  progressRecords: Progress[]
): number {
  if (!lessons.length) return 0;
  const completedIds = new Set(
    progressRecords.filter((p) => p.completed).map((p) => p.lesson_id)
  );
  const completed = lessons.filter((l) => completedIds.has(l.id)).length;
  return Math.round((completed / lessons.length) * 100);
}
