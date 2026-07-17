import { useState, useEffect } from 'react';
import { UserPlus, Search, X, Users, BookOpen, Mail, Calendar, Trash2, KeyRound } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { adminEnrollStudent } from '../../../../lib/enrollments';
import { adminDeleteStudent, adminResetStudentPassword } from '../../../../lib/adminUsers';
import { createClient } from '@supabase/supabase-js';
import { ConfirmModal } from '../../shared/Modals';

interface Student {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  created_at: string;
  enrollmentCount?: number;
}

export function StudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selCourse, setSelCourse] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [resetTarget, setResetTarget] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      // Load students with their enrollment count
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (!data) return setStudents([]);

      // Fetch enrollment counts
      const withCounts = await Promise.all(
        data.map(async s => {
          const { count } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact' })
            .eq('user_id', s.id);
          return { ...s, enrollmentCount: count ?? 0 };
        })
      );
      setStudents(withCounts);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password) {
      return showToast('Completa todos los campos', false);
    }
    setSaving(true);
    try {
      // Use a secondary Supabase client to avoid disrupting the admin session
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
      const { error } = await tempClient.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } }
      });
      if (error) throw error;

      showToast(`Estudiante "${form.full_name}" creado exitosamente ✓`);
      setShowAdd(false);
      setForm({ full_name: '', email: '', password: '' });
      setTimeout(load, 1500);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const openEnrollModal = async (student: Student) => {
    setSelectedStudent(student);
    const { data } = await supabase.from('courses').select('id, title').order('title');
    setCourses(data ?? []);
    setSelCourse('');
    setShowEnroll(true);
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selCourse) return showToast('Selecciona un curso', false);
    setSaving(true);
    try {
      await adminEnrollStudent(selectedStudent.id, selCourse);
      showToast(`${selectedStudent.full_name} matriculado exitosamente ✓`);
      setShowEnroll(false);
      load();
    } catch (e: any) {
      showToast(e.message.includes('unique') ? 'Ya está matriculado en ese curso' : e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await adminDeleteStudent(deleteConfirm.id);
      showToast(`Estudiante "${deleteConfirm.full_name}" eliminado`);
      setDeleteConfirm(null);
      load();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const openResetModal = (student: Student) => {
    setResetTarget(student);
    setNewPassword('');
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 6) return showToast('La nueva clave debe tener al menos 6 caracteres', false);
    setSaving(true);
    try {
      await adminResetStudentPassword(resetTarget.id, newPassword);
      showToast(`Clave de ${resetTarget.full_name} restablecida ✓ Deberá cambiarla al ingresar`);
      setResetTarget(null);
      setNewPassword('');
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return s.full_name?.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Estudiante"
        message={`¿Seguro que deseas eliminar permanentemente a "${deleteConfirm?.full_name}"? Se borrará su cuenta, perfil y todas sus matrículas. Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm
          ${toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-lms-text-primary">Estudiantes</h1>
          <p className="text-sm text-lms-text-muted mt-1">{students.length} estudiantes registrados</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/20"
        >
          <UserPlus size={18} /> Añadir Estudiante
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-3 bg-lms-surface border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-lms-border text-xs uppercase tracking-wider text-lms-text-muted">
                <th className="px-5 py-4 font-bold">Estudiante</th>
                <th className="px-5 py-4 font-bold">Email</th>
                <th className="px-5 py-4 font-bold text-center">Cursos</th>
                <th className="px-5 py-4 font-bold">Registro</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-border">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-8 bg-lms-hover rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-lms-text-muted">
                      <Users size={32} className="opacity-30" />
                      <p className="text-sm">{search ? 'Sin resultados.' : 'Aún no hay estudiantes. ¡Añade el primero!'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-lms-hover transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(s.full_name || s.email || 'U').slice(0,2).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-lms-text-primary">{s.full_name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-lms-text-muted">
                        <Mail size={13} />
                        {s.email}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                        (s.enrollmentCount ?? 0) > 0
                          ? 'bg-violet-500/15 text-violet-400'
                          : 'bg-lms-hover text-lms-text-muted'
                      }`}>
                        {s.enrollmentCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-lms-text-muted">
                        <Calendar size={12} />
                        {new Date(s.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEnrollModal(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors"
                        >
                          <BookOpen size={12} /> Matricular
                        </button>
                        <button
                          onClick={() => openResetModal(s)}
                          title="Restablecer clave"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
                        >
                          <KeyRound size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s)}
                          title="Eliminar estudiante"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lms-surface border border-lms-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-lms-border">
              <h2 className="font-black text-lms-text-primary">Nuevo Estudiante</h2>
              <button onClick={() => setShowAdd(false)} className="text-lms-text-muted hover:text-lms-text-primary"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nombre Completo', key: 'full_name', type: 'text', placeholder: 'Ej: Juan Pérez' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'juan@email.com' },
                { label: 'Contraseña', key: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-lms-border text-lms-text-muted hover:bg-lms-hover font-semibold text-sm transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20">
                {saving ? 'Creando...' : 'Crear Estudiante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnroll && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lms-surface border border-lms-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-lms-border">
              <div>
                <h2 className="font-black text-lms-text-primary">Matricular Estudiante</h2>
                <p className="text-xs text-lms-text-muted mt-0.5">{selectedStudent.full_name}</p>
              </div>
              <button onClick={() => setShowEnroll(false)} className="text-lms-text-muted hover:text-lms-text-primary"><X size={20} /></button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Selecciona el Curso</label>
              <select
                value={selCourse}
                onChange={e => setSelCourse(e.target.value)}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm text-lms-text-primary focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">-- Selecciona un curso --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowEnroll(false)} className="flex-1 py-3 rounded-xl border border-lms-border text-lms-text-muted hover:bg-lms-hover font-semibold text-sm transition-colors">Cancelar</button>
              <button onClick={handleEnroll} disabled={saving} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20">
                {saving ? 'Matriculando...' : 'Confirmar Matrícula'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lms-surface border border-lms-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-lms-border">
              <div>
                <h2 className="font-black text-lms-text-primary">Restablecer Clave</h2>
                <p className="text-xs text-lms-text-muted mt-0.5">{resetTarget.full_name}</p>
              </div>
              <button onClick={() => setResetTarget(null)} className="text-lms-text-muted hover:text-lms-text-primary"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Nueva Clave Temporal</label>
              <input
                type="text"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <p className="text-xs text-lms-text-muted">El estudiante deberá cambiarla la próxima vez que ingrese.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setResetTarget(null)} className="flex-1 py-3 rounded-xl border border-lms-border text-lms-text-muted hover:bg-lms-hover font-semibold text-sm transition-colors">Cancelar</button>
              <button onClick={handleResetPassword} disabled={saving} className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20">
                {saving ? 'Guardando...' : 'Restablecer Clave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
