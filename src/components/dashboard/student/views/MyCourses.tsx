import { useState, useEffect } from 'react';
import { BookOpen, Clock, ChevronRight, Award } from 'lucide-react';
import { getMyEnrollments } from '../../../../lib/enrollments';
import { supabase } from '../../../../lib/supabase';

interface Props {
  onCourseSelect: (courseId: string) => void;
}

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
  };
  progress?: number;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function MyCourses({ onCourseSelect }: Props) {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyEnrollments() as unknown as EnrolledCourse[];
        
        // Calculate progress for each course
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const withProgress = await Promise.all(data.map(async (e) => {
          const courseId = e.courses?.id;
          if (!courseId) return { ...e, progress: 0 };

          // 1. Get module IDs for this course
          const { data: modulesData } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', courseId);
          
          const moduleIds = modulesData?.map(m => m.id) || [];
          if (moduleIds.length === 0) return { ...e, progress: 0 };

          // 2. Get total lessons for these modules
          const { count: total } = await supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .in('module_id', moduleIds);

          // 3. Get lesson IDs for these modules to check progress
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
          return { ...e, progress: pct };
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
        {enrollments.map(e => {
          const course = e.courses;
          const pct = e.progress ?? 0;
          const done = pct === 100;
          return (
            <button
              key={e.id}
              onClick={() => onCourseSelect(course.id)}
              className="text-left bg-lms-surface border border-lms-border rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200 group flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-lms-hover overflow-hidden">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                <h3 className="text-sm font-bold text-lms-text-primary line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors">
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
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-sky-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-lms-border">
                  <div className="flex items-center gap-1 text-xs text-lms-text-muted">
                    <Clock size={11} />
                    {course.duration_hrs}h · {LEVEL_LABELS[course.level] ?? course.level}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:gap-2 transition-all">
                    Continuar <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
