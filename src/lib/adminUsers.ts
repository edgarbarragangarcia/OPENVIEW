import { supabase } from './supabase';

async function invokeAdminAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('admin-manage-student', { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

/** [ADMIN] Elimina permanentemente la cuenta de un estudiante (auth + perfil + matrículas) */
export async function adminDeleteStudent(userId: string) {
  return invokeAdminAction({ action: 'delete', userId });
}

/** [ADMIN] Restablece la clave de un estudiante y lo obliga a cambiarla en su próximo ingreso */
export async function adminResetStudentPassword(userId: string, newPassword: string) {
  return invokeAdminAction({ action: 'reset_password', userId, newPassword });
}
