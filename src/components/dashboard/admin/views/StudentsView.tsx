import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { User as UserIcon, UserPlus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

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
  const [showModal, setShowModal] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [creating, setCreating] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
      
    if (data) setStudents(data as unknown as Student[]);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email || !newStudent.password || !newStudent.full_name) {
      return toast.error('Todos los campos son obligatorios');
    }
    setCreating(true);

    try {
      // Usamos un cliente temporal sin persistencia para no cerrar la sesión del admin
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { error } = await tempClient.auth.signUp({
        email: newStudent.email,
        password: newStudent.password,
        options: {
          data: {
            full_name: newStudent.full_name,
          }
        }
      });

      if (error) throw error;
      
      toast.success('Estudiante creado exitosamente');
      setShowModal(false);
      setNewStudent({ email: '', password: '', full_name: '' });
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear estudiante');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Estudiantes</h1>
          <p className="text-slate-500">Administra los usuarios registrados en la plataforma</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors shadow-sm"
        >
          <UserPlus size={18} /> Añadir Estudiante
        </button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Añadir Estudiante</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required
                  value={newStudent.full_name} onChange={e => setNewStudent({...newStudent, full_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                <input 
                  type="password" required minLength={6}
                  value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
