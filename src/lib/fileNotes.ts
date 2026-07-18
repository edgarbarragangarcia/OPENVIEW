import { supabase } from './supabase';

/**
 * Notas por usuario y por archivo, persistidas en Supabase (tabla file_notes).
 * Se identifican por la URL del archivo, así las notas siguen al usuario entre
 * dispositivos. Como respaldo local seguimos guardando en localStorage.
 */

/** Devuelve las notas guardadas del usuario para un archivo, o '' si no hay. */
export async function getFileNotes(fileUrl: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '';

  const { data, error } = await supabase
    .from('file_notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('file_url', fileUrl)
    .maybeSingle();
  if (error) throw error;
  return data?.content ?? '';
}

/** Crea o actualiza (upsert) las notas del usuario para un archivo. */
export async function saveFileNotes(fileUrl: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { error } = await supabase
    .from('file_notes')
    .upsert(
      { user_id: user.id, file_url: fileUrl, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,file_url' }
    );
  if (error) throw error;
}
