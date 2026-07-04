import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { User as UserIcon } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export function StudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      // In a real app we might want to query auth.users joined with profiles, 
      // but since we can't query auth.users directly without service role, 
      // we query profiles which has full_name. We'll show profiles.
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });
        
      if (data) setStudents(data as unknown as Student[]);
      setLoading(false);
    }
    loadStudents();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Estudiantes</h1>
        <p className="text-slate-500">Administra los usuarios registrados en la plataforma</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500">
                <th className="p-4 font-bold">Estudiante</th>
                <th className="p-4 font-bold">Rol</th>
                <th className="p-4 font-bold">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">Cargando estudiantes...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">No hay estudiantes registrados.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{student.full_name || 'Sin nombre'}</span>
                          <span className="text-xs text-slate-500">{student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-600 capitalize">
                        {student.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
