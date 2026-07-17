import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, Eye, EyeOff, BookOpen, Search, Users, PlayCircle, PauseCircle } from 'lucide-react';
import { Course, getCourses, updateCourse, deleteCourse } from '../../../../lib/courses';
import { ConfirmModal } from '../../shared/Modals';

interface CoursesManagerProps {
  onEdit: (courseId?: string) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400',
  intermediate: 'bg-amber-500/10 text-amber-400',
  advanced: 'bg-red-500/10 text-red-400',
};

export function CoursesManager({ onEdit }: CoursesManagerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCourses(false);
      setCourses(data);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (course: Course) => {
    try {
      await updateCourse(course.id, { published: !course.published });
      showToast(course.published ? 'Curso despublicado' : 'Curso publicado ✓');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  const toggleStarted = async (course: Course) => {
    try {
      await updateCourse(course.id, { started: !course.started });
      showToast(course.started ? 'Curso pausado: el contenido volverá a verse borroso para los estudiantes' : 'Curso iniciado ✓ Los estudiantes ya pueden ver el contenido');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCourse(deleteConfirm.id);
      showToast('Curso eliminado');
      load();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      
      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Eliminar Curso"
        message={`¿Estás seguro de que deseas eliminar el curso "${deleteConfirm?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar Curso"
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
          <h1 className="text-2xl font-black text-lms-text-primary">Cursos</h1>
          <p className="text-sm text-lms-text-muted mt-1">{courses.length} cursos en total</p>
        </div>
        <button
          onClick={() => onEdit()}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus size={18} /> Nuevo Curso
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full pl-10 pr-4 py-3 bg-lms-surface border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-lms-surface rounded-2xl animate-pulse border border-lms-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-lms-surface border border-lms-border rounded-2xl flex flex-col items-center justify-center py-20 gap-4 text-lms-text-muted">
          <BookOpen size={40} className="opacity-20" />
          <p className="font-semibold">{search ? 'Sin resultados.' : 'Aún no hay cursos. ¡Crea el primero!'}</p>
          {!search && (
            <button onClick={() => onEdit()} className="mt-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-colors">
              + Crear Primer Curso
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden card-glow card-glow-violet transition-colors duration-200 group flex flex-col"
            >
              {/* Cover */}
              <div className="relative h-44 bg-lms-hover overflow-hidden">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={36} className="text-lms-text-muted/30" />
                  </div>
                )}
                {/* Status badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                  course.published
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {course.published ? <Eye size={11} /> : <EyeOff size={11} />}
                  {course.published ? 'Publicado' : 'Borrador'}
                </div>
                {/* Started badge */}
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                  course.started
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                }`}>
                  {course.started ? <PlayCircle size={11} /> : <PauseCircle size={11} />}
                  {course.started ? 'Iniciado' : 'Sin iniciar'}
                </div>
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(course.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
                  >
                    <Edit3 size={13} /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(course)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-red-300 rounded-xl text-xs font-bold border border-red-500/30 transition-colors"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-lms-text-primary line-clamp-2 flex-1">{course.title}</h3>
                  {course.level && (
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-lms-hover text-lms-text-muted'}`}>
                      {LEVEL_LABELS[course.level] ?? course.level}
                    </span>
                  )}
                </div>
                <p className="text-xs text-lms-text-muted line-clamp-2 flex-1">{course.description || 'Sin descripción'}</p>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-lms-border flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-lms-text-muted">
                    <Users size={12} />
                    {(course.enrollments as any)?.[0]?.count ?? 0} inscritos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStarted(course)}
                      title={course.started ? 'Pausar: el contenido volverá a verse borroso para los estudiantes' : 'Iniciar: los estudiantes podrán ver el contenido de las lecciones'}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        course.started
                          ? 'bg-lms-hover text-lms-text-muted hover:text-slate-400'
                          : 'bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30'
                      }`}
                    >
                      {course.started ? <PauseCircle size={13} /> : <PlayCircle size={13} />}
                      {course.started ? 'Pausar' : 'Iniciar curso'}
                    </button>
                    <button
                      onClick={() => togglePublish(course)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        course.published
                          ? 'bg-lms-hover text-lms-text-muted hover:text-amber-400'
                          : 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30'
                      }`}
                    >
                      {course.published ? 'Despublicar' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
