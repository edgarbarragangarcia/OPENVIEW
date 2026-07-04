import { useState, useEffect } from 'react';
import { BookOpen, Clock, Search, Filter } from 'lucide-react';
import { getCourses, Course } from '../../../../lib/courses';
import { enrollInCourse, isEnrolled } from '../../../../lib/enrollments';

interface Props {
  onEnroll: () => void;
  onCourseSelect: (courseId: string) => void;
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

export function Explore({ onEnroll, onCourseSelect }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses(true);
        setCourses(data);
        // Check which ones we're already enrolled in
        const checks = await Promise.all(data.map(c => isEnrolled(c.id).then(v => ({ id: c.id, enrolled: v }))));
        setEnrolledIds(new Set(checks.filter(c => c.enrolled).map(c => c.id)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleEnroll = async (courseId: string, title: string) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
      showToast(`¡Te has inscrito en "${title}"! ✓`);
      setTimeout(onEnroll, 1500);
    } catch (e: any) {
      showToast(e.message.includes('unique') ? 'Ya estás inscrito en este curso' : e.message, false);
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm ${toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-lms-text-primary">Explorar Cursos</h1>
        <p className="text-sm text-lms-text-muted mt-1">Descubre y únete a nuevos programas de aprendizaje</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full pl-10 pr-4 py-3 bg-lms-surface border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-72 bg-lms-surface rounded-2xl animate-pulse border border-lms-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-lms-text-muted gap-4">
          <Filter size={32} className="opacity-20" />
          <p className="text-sm">{search ? 'Sin resultados para tu búsqueda.' : 'No hay cursos publicados aún.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(course => {
            const already = enrolledIds.has(course.id);
            return (
              <div key={course.id} className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all duration-200 flex flex-col group">
                <div className="relative h-44 bg-lms-hover overflow-hidden">
                  {course.cover_url ? (
                    <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={36} className="text-lms-text-muted/30" />
                    </div>
                  )}
                  {course.categories?.name && (
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/20">
                      {course.categories.name}
                    </div>
                  )}
                  {course.price > 0 && (
                    <div className="absolute top-3 right-3 bg-violet-600/90 text-white text-xs font-black px-2 py-1 rounded-lg">
                      ${course.price}
                    </div>
                  )}
                </div>
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
                  <div className="mt-4 pt-3 border-t border-lms-border flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-lms-text-muted">
                      <Clock size={11} />
                      {course.duration_hrs}h
                    </div>
                    {already ? (
                      <button
                        onClick={() => onCourseSelect(course.id)}
                        className="text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-500/5 flex items-center gap-2"
                      >
                        ✓ Inscrito <span className="font-normal opacity-70">· Entrar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id, course.title)}
                        disabled={enrolling === course.id}
                        className="text-xs font-bold px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                      >
                        {enrolling === course.id ? 'Inscribiendo...' : 'Inscribirme'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
