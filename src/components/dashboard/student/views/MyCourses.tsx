import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock } from 'lucide-react';
import { getMyEnrollments, getCourseProgress } from '../../../../lib/enrollments';
import { supabase } from '../../../../lib/supabase';

interface Props {
  onEnter: (courseId: string) => void;
  onCourseSelect: (courseId: string) => void;
}

interface EnrolledCourse {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  duration_hrs: number | null;
  level: string | null;
  categories?: { name: string } | null;
  progress: number;
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

export function MyCourses({ onEnter, onCourseSelect }: Props) {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const data = await getMyEnrollments();
        const withProgress = await Promise.all(
          (data || [])
            .filter((e: any) => e.courses)
            .map(async (e: any) => ({
              ...e.courses,
              progress: user ? await getCourseProgress(user.id, e.courses.id) : 0,
            }))
        );
        setCourses(withProgress);
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
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-white/20" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Sin cursos aún</h3>
        <p className="text-slate-400 text-sm max-w-xs">Aún no estás matriculado en ningún curso. Pídele al administrador que te inscriba.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Mi Aprendizaje</h1>
        <p className="text-sm text-slate-400 mt-1">Tus cursos en progreso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: idx * 0.05 }}
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden card-glow card-glow-cyan transition-all duration-200 flex flex-col group cursor-pointer"
            onClick={() => onCourseSelect(course.id)}
          >
            <div className="relative h-44 bg-white/5 overflow-hidden">
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={36} className="text-white/20" />
                </div>
              )}
              {course.categories?.name && (
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-cyan-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/20">
                  {course.categories.name}
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-white line-clamp-2 flex-1">{course.title}</h3>
                {course.level && (
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-white/10 text-slate-300'}`}>
                    {LEVEL_LABELS[course.level] ?? course.level}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                <Clock size={11} />
                {course.duration_hrs}h
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <span>Avance</span>
                  <span className="text-cyan-400">{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onEnter(course.id); }}
                  className="w-full text-xs font-bold px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {course.progress > 0 ? 'Continuar curso' : 'Comenzar curso'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
