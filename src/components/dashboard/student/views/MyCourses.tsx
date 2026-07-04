import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { CourseCard } from '../../shared/CourseCard';
import { getMyEnrollments, getMyProgress, calcProgress } from '../../../../lib/enrollments';
import { useAuth } from '../../../../contexts/AuthContext';

export function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const enrolls = await getMyEnrollments(user!.id);
      const prog = await getMyProgress(user!.id);
      
      const pMap: Record<string, number> = {};
      enrolls.forEach(e => {
        const course = e.courses;
        if (!course) return;
        const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || [];
        pMap[course.id] = calcProgress(allLessons, prog);
      });
      
      setEnrollments(enrolls);
      setProgressMap(pMap);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) return <div className="p-8 text-slate-500">Cargando tus cursos...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Mis Cursos</h1>
        <p className="text-slate-500">Continúa donde te quedaste</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aún no tienes cursos</h3>
          <p className="text-slate-500 mb-6">Explora nuestro catálogo y empieza a aprender hoy mismo.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enrollments.map(enrollment => {
            if (!enrollment.courses) return null;
            return (
              <CourseCard 
                key={enrollment.id}
                course={enrollment.courses} 
                progress={progressMap[enrollment.course_id] || 0}
                onClick={(c) => console.log('Go to course', c.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
