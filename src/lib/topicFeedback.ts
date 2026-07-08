import { supabase } from './supabase';

export type TopicStatus = 'pending' | 'understood' | 'not_understood';

export interface TopicFeedback {
  topic_index: number;
  status: TopicStatus;
}

/** Obtener el feedback del usuario actual para los temas de una lección */
export async function getTopicFeedback(lessonId: string): Promise<Map<number, TopicStatus>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Map();

  const { data, error } = await supabase
    .from('topic_feedback')
    .select('topic_index, status')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId);
  if (error) throw error;

  return new Map((data as TopicFeedback[] ?? []).map(f => [f.topic_index, f.status]));
}

/** Guardar el estado de un tema para el usuario actual */
export async function setTopicStatus(lessonId: string, topicIndex: number, topicText: string, status: TopicStatus) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('topic_feedback')
    .upsert(
      { user_id: user.id, lesson_id: lessonId, topic_index: topicIndex, topic_text: topicText, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_id,topic_index' }
    );
  if (error) throw error;
}

export interface AdminTopicFeedback {
  id: string;
  topic_text: string;
  status: TopicStatus;
  updated_at: string;
  lesson_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
  lessons: { title: string; modules: { title: string; courses: { title: string } | null } | null } | null;
}

/** [ADMIN] Temas marcados como "no entendido" por los estudiantes, más recientes primero */
export async function getNotUnderstoodFeedback(): Promise<AdminTopicFeedback[]> {
  const { data, error } = await supabase
    .from('topic_feedback')
    .select('id, topic_text, status, updated_at, lesson_id, profiles(full_name, email), lessons(title, modules(title, courses(title)))')
    .eq('status', 'not_understood')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as AdminTopicFeedback[]) ?? [];
}
