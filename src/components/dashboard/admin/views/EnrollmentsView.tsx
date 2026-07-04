import { useState, useEffect } from 'react';
import { Search, Plus, X, BookOpen, UserCheck, Trash2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { getAllEnrollments, adminEnrollStudent, adminRemoveEnrollment } from '../../../../lib/enrollments';
import { ConfirmModal } from '../../shared/Modals';

interface Course { id: string; title: string }
interface Student { id: string; full_name: string; email?: string }

export function EnrollmentsView() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selStudent, setSelStudent] = useState('');
  const [selCourse, setSelCourse] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllEnrollments();
      setEnrollments(data);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = async () => {
    const [st, co] = await Promise.all([
      supabase.from('profiles').select('id, full_name').eq('role', 'student').order('full_name'),
      supabase.from('courses').select('id, title').order('title'),
    ]);
    setStudents(st.data ?? []);
    setCourses(co.data ?? []);
    setSelStudent('');
    setSelCourse('');
    setShowModal(true);
  };

  const handleEnroll = async () => {
    if (!selStudent || !selCourse) return showToast('Selecciona un estudiante y un curso', false);
    setSaving(true);
    try {
      await adminEnrollStudent(selStudent, selCourse);
      showToast('Matrícula creada exitosamente ✓');
      setShowModal(false);
      load();
    } catch (e: any) {
      showToast(e.message.includes('unique') ? 'Este estudiante ya está matriculado en ese curso' : e.message, false);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminRemoveEnrollment(deleteConfirm.id);
      showToast('Matrícula eliminada exitosamente');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    return (
      e.profiles?.full_name?.toLowerCase().includes(q) ||
      e.profiles?.email?.toLowerCase().includes(q) ||
      e.courses?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      
      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Matrícula"
        message={`¿Seguro que deseas desmatricular a "${deleteConfirm?.name}"? Se perderá su progreso.`}
        confirmText="Eliminar Matrícula"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm transition-all
          ${toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? <UserCheck size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-lms-text-primary">Matrículas</h1>
          <p className="text-sm text-lms-text-muted mt-1">Gestiona qué estudiantes acceden a qué cursos</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus size={18} /> Nueva Matrícula
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por estudiante o curso..."
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
                <th className="px-5 py-4 font-bold">Curso</th>
                <th className="px-5 py-4 font-bold">Matriculado</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-border">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="h-8 bg-lms-hover rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center text-lms-text-muted text-sm">
                    {search ? 'No se encontraron resultados.' : 'No hay matrículas aún. ¡Crea la primera!'}
                  </td>
                </tr>
              ) : (
                filtered.map(e => (
                  <tr key={e.id} className="hover:bg-lms-hover transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(e.profiles?.full_name ?? 'U').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-lms-text-primary">{e.profiles?.full_name ?? '-'}</p>
                          <p className="text-xs text-lms-text-muted">{e.profiles?.email ?? '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-violet-400 shrink-0" />
                        <span className="text-sm text-lms-text-primary font-medium line-clamp-1">
                          {e.courses?.title ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-lms-text-muted">
                      {new Date(e.enrolled_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => confirmDelete(e.id, e.profiles?.full_name || 'Estudiante')}
                        className="p-1.5 text-lms-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar matrícula"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lms-surface border border-lms-border rounded-2xl w-full max-w-md shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-lms-border">
              <h2 className="font-black text-lms-text-primary">Nueva Matrícula</h2>
              <button onClick={() => setShowModal(false)} className="text-lms-text-muted hover:text-lms-text-primary">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Estudiante</label>
                <select
                  value={selStudent}
                  onChange={e => setSelStudent(e.target.value)}
                  className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm text-lms-text-primary focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">-- Selecciona un estudiante --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name || 'Sin nombre'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Curso</label>
                <select
                  value={selCourse}
                  onChange={e => setSelCourse(e.target.value)}
                  className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm text-lms-text-primary focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">-- Selecciona un curso --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-lms-border text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover font-semibold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnroll}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20"
              >
                {saving ? 'Guardando...' : 'Matricular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
