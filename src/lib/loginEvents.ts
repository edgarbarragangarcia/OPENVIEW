import { supabase } from './supabase';

export interface LoginEvent {
  id: number;
  user_id: string;
  logged_in_at: string;
}

export interface UserConnectionStats {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  count: number;
  lastLoginAt: string | null;
  recentLogins: string[];
}

/** [ADMIN] Estadísticas de conexión por usuario: cuántas veces y a qué horas ha
 *  ingresado cada quien. Trae todos los perfiles y todos los eventos en dos
 *  consultas y agrega en cliente, en vez de una consulta por usuario. */
export async function getConnectionStats(): Promise<UserConnectionStats[]> {
  const [{ data: profiles, error: profilesError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role'),
    supabase.from('login_events').select('user_id, logged_in_at').order('logged_in_at', { ascending: false }),
  ]);
  if (profilesError) throw profilesError;
  if (eventsError) throw eventsError;

  const eventsByUser = new Map<string, string[]>();
  for (const e of events ?? []) {
    const list = eventsByUser.get(e.user_id) ?? [];
    list.push(e.logged_in_at);
    eventsByUser.set(e.user_id, list);
  }

  return (profiles ?? []).map(p => {
    const logins = eventsByUser.get(p.id) ?? [];
    return {
      user_id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      count: logins.length,
      lastLoginAt: logins[0] ?? null,
      recentLogins: logins.slice(0, 10),
    };
  });
}
