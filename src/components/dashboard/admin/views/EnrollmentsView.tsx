import { useState, useEffect } from 'react';
import { Search, Plus, X, BookOpen, UserCheck, Trash2, ChevronDown, Lock, Unlock } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import {
  getAllEnrollments,
  adminEnrollStudent,
  adminRemoveEnrollment,
  adminSetEnrollmentAccess,
  adminSetCourseAccess,
} from '../../../../lib/enrollments';
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
  // Groups start collapsed; a course key is added here only once the admin expands it.
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const toggleCourse = (courseKey: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseKey)) next.delete(courseKey);
      else next.add(courseKey);
      return next;
    });
  };

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

  const handleToggleAccess = async (enrollmentId: string, current: boolean) => {
    // Optimistic update so the switch feels instant
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, access_enabled: !current } : e));
    try {
      await adminSetEnrollmentAccess(enrollmentId, !current);
    } catch (e: any) {
      showToast(e.message, false);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, access_enabled: current } : e));
    }
  };

  const handleToggleCourseAccess = async (courseId: string, nextEnabled: boolean) => {
    setEnrollments(prev => prev.map(e => e.course_id === courseId ? { ...e, access_enabled: nextEnabled } : e));
    try {
      await adminSetCourseAccess(courseId, nextEnabled);
      showToast(nextEnabled ? 'Acceso habilitado para todo el curso ✓' : 'Acceso bloqueado para todo el curso');
    } catch (e: any) {
      showToast(e.message, false);
      load();
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

  const groupedByCourse = filtered.reduce((acc: Record<string, { title: string; items: any[] }>, e) => {
    const key = e.course_id ?? e.courses?.title ?? '-';
    if (!acc[key]) acc[key] = { title: e.courses?.title ?? 'Sin curso', items: [] };
    acc[key].items.push(e);
    return acc;
  }, {});
  const courseGroups = Object.entries(groupedByCourse).sort((a, b) => a[1].title.localeCompare(b[1].title));

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

      {/* Grouped by course, collapsible */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-lms-surface border border-lms-border rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-lms-surface border border-lms-border rounded-2xl px-5 py-14 text-center text-lms-text-muted text-sm">
          {search ? 'No se encontraron resultados.' : 'No hay matrículas aún. ¡Crea la primera!'}
        </div>
      ) : (
        <div className="space-y-4">
          {courseGroups.map(([courseKey, group]) => {
            const isCollapsed = !expandedCourses.has(courseKey);
            const allBlocked = group.items.every(e => !e.access_enabled);
            return (
              <div key={courseKey} className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
                <div className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-lms-hover transition-colors">
                  <button onClick={() => toggleCourse(courseKey)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <BookOpen size={16} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-lms-text-primary truncate">{group.title}</p>
                      <p className="text-xs text-lms-text-muted">{group.items.length} estudiante{group.items.length !== 1 ? 's' : ''} matriculado{group.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleToggleCourseAccess(courseKey, allBlocked)}
                    title={allBlocked ? 'Habilitar acceso para todo el curso' : 'Bloquear acceso para todo el curso'}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      allBlocked
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {allBlocked ? <Lock size={13} /> : <Unlock size={13} />}
                    {allBlocked ? 'Bloqueado' : 'Habilitado'}
                  </button>
                  <button onClick={() => toggleCourse(courseKey)} className="shrink-0 p-1">
                    <ChevronDown
                      size={18}
                      className={`text-lms-text-muted transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    />
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-lms-border">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-lms-border text-xs uppercase tracking-wider text-lms-text-muted">
                          <th className="px-5 py-3 font-bold w-12">#</th>
                          <th className="px-5 py-3 font-bold">Estudiante</th>
                          <th className="px-5 py-3 font-bold">Matriculado</th>
                          <th className="px-5 py-3 font-bold">Acceso</th>
                          <th className="px-5 py-3 font-bold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-lms-border">
                        {group.items.map((e, idx) => (
                          <tr key={e.id} className="hover:bg-lms-hover transition-colors group">
                            <td className="px-5 py-3 text-sm font-semibold text-lms-text-muted">{idx + 1}</td>
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
                            <td className="px-5 py-3 text-sm text-lms-text-muted">
                              {new Date(e.enrolled_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => handleToggleAccess(e.id, e.access_enabled)}
                                title={e.access_enabled ? 'Clic para bloquear el acceso' : 'Clic para habilitar el acceso'}
                                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${e.access_enabled ? 'bg-emerald-500' : 'bg-lms-border'}`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${e.access_enabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                              </button>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
