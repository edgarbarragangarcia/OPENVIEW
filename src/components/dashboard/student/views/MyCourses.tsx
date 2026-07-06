import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, ChevronRight, Award, Play, FileText, ChevronDown } from 'lucide-react';
import { getMyEnrollments } from '../../../../lib/enrollments';
import { supabase } from '../../../../lib/supabase';

interface Props {
  onCourseSelect: (courseId: string) => void;
}

interface Lesson { id: string; title: string; position: number; duration_min: number; video_url: string | null; pdf_url: string | null; }
interface Module { id: string; title: string; position: number; lessons: Lesson[]; }

interface EnrolledCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    cover_url: string;
    duration_hrs: number;
    level: string;
    categories?: { name: string };
    modules?: Module[];
  };
  progress?: number;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

function CourseCard({ enrollment, onCourseSelect }: { enrollment: EnrolledCourse; onCourseSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const course = enrollment.courses;
  const pct = enrollment.progress ?? 0;
  const done = pct === 100;
  const modules = course.modules?.sort((a, b) => a.position - b.position) ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-colors duration-200 flex flex-col"
    >
      {/* Thumbnail */}
      <div
        className="relative h-44 bg-lms-hover overflow-hidden cursor-pointer"
        onClick={() => onCourseSelect(course.id)}
      >
        {course.cover_url ? (
          <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={36} className="text-lms-text-muted/30" />
          </div>
        )}
        {done && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Award size={11} /> Completado
          </div>
        )}
        {course.categories?.name && (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/20">
            {course.categories.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-sm font-bold text-lms-text-primary line-clamp-2 mb-1 cursor-pointer hover:text-cyan-400 transition-colors"
          onClick={() => onCourseSelect(course.id)}
        >
          {course.title}
        </h3>
        <p className="text-xs text-lms-text-muted mb-4 line-clamp-2">{course.description || 'Sin descripción'}</p>

        {/* Progress bar */}
        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-lms-text-muted font-medium">Progreso</span>
            <span className={`font-bold ${done ? 'text-emerald-400' : 'text-cyan-400'}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-lms-hover rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className={`h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-sky-600'}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-lms-border">
          <div className="flex items-center gap-1 text-xs text-lms-text-muted">
            <Clock size={11} />
            {course.duration_hrs}h · {LEVEL_LABELS[course.level] ?? course.level}
          </div>
          <div className="flex items-center gap-2">
            {modules.length > 0 && (
              <motion.button
                onClick={() => setExpanded(!expanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-xs font-semibold text-lms-text-muted hover:text-lms-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-lms-hover"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <ChevronDown size={13} />
                </motion.div>
                Temario
              </motion.button>
            )}
            <motion.button
              onClick={() => onCourseSelect(course.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Continuar <ChevronRight size={13} />
            </motion.button>
          </div>
        </div>

        {/* Module/Lesson roadmap */}
        <AnimatePresence initial={false}>
          {expanded && modules.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-lms-border space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-lms-text-muted">Ruta de aprendizaje</p>
                {modules.map((mod, mIdx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mIdx * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
                    className="space-y-1.5"
                  >
                    {/* Module header */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-cyan-500">{mIdx + 1}</span>
                      </div>
                      <span className="text-xs font-bold text-lms-text-primary line-clamp-1">{mod.title}</span>
                    </div>

                    {/* Lessons */}
                    {mod.lessons.sort((a, b) => a.position - b.position).map((lesson, lIdx) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mIdx * 0.06 + lIdx * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                        className="flex items-center gap-2 pl-7"
                      >
                        <div className="w-1 h-1 rounded-full bg-lms-text-muted/40 shrink-0" />
                        <span className="text-[11px] text-lms-text-muted line-clamp-1 flex-1">
                          {lIdx + 1}. {lesson.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {lesson.video_url && <Play size={9} className="text-lms-text-muted/50" />}
                          {lesson.pdf_url && <FileText size={9} className="text-lms-text-muted/50" />}
                          {lesson.duration_min > 0 && (
                            <span className="text-[9px] text-lms-text-muted/50">{lesson.duration_min}m</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}

                <motion.button
                  onClick={() => onCourseSelect(course.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow"
                >
                  Continuar donde lo dejé <ChevronRight size={13} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function MyCourses({ onCourseSelect }: Props) {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyEnrollments() as unknown as EnrolledCourse[];

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const withProgress = await Promise.all(data.map(async (e) => {
          const courseId = e.courses?.id;
          if (!courseId) return { ...e, progress: 0 };

          // Fetch modules WITH their lessons for the roadmap
          const { data: modulesData } = await supabase
            .from('modules')
            .select('id, title, position, lessons(id, title, position, duration_min, video_url, pdf_url)')
            .eq('course_id', courseId)
            .order('position');

          const moduleIds = modulesData?.map(m => m.id) || [];
          if (moduleIds.length === 0) return { ...e, progress: 0, courses: { ...e.courses, modules: [] } };

          const { count: total } = await supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .in('module_id', moduleIds);

          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('id')
            .in('module_id', moduleIds);

          const lessonIds = lessonsData?.map(l => l.id) || [];
          let done = 0;

          if (lessonIds.length > 0) {
            const { count } = await supabase
              .from('progress')
              .select('id', { count: 'exact' })
              .eq('user_id', user.id)
              .eq('completed', true)
              .in('lesson_id', lessonIds);
            done = count ?? 0;
          }

          const pct = total ? Math.round((done / total) * 100) : 0;
          return { ...e, progress: pct, courses: { ...e.courses, modules: modulesData as unknown as Module[] } };
        }));

        setEnrollments(withProgress);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-lms-surface rounded-2xl animate-pulse border border-lms-border" />)}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-lms-surface border border-lms-border flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-lms-text-muted/40" />
        </div>
        <h3 className="text-xl font-black text-lms-text-primary mb-2">Sin cursos aún</h3>
        <p className="text-lms-text-muted text-sm max-w-xs">Aún no estás matriculado en ningún curso. Pídele al administrador que te inscriba.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-lms-text-primary">Mi Aprendizaje</h1>
        <p className="text-sm text-lms-text-muted mt-1">{enrollments.length} curso{enrollments.length !== 1 ? 's' : ''} en progreso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {enrollments.map(e => (
          <CourseCard key={e.id} enrollment={e} onCourseSelect={onCourseSelect} />
        ))}
      </div>
    </div>
  );
}
