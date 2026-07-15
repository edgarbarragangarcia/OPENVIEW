import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { getMyEnrollments } from '../../../../lib/enrollments';
import { CourseDetail } from './CourseDetail';

interface Props {
  onEnter: (courseId: string) => void;
  onCourseSelect: (courseId: string) => void;
}

export function MyCourses({ onEnter, onCourseSelect }: Props) {
  const [firstCourseId, setFirstCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyEnrollments();
        if (data && data.length > 0 && data[0].courses) {
          setFirstCourseId(data[0].courses.id);
        }
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

  if (!firstCourseId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-white">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Sin cursos aún</h3>
        <p className="text-slate-500 text-sm max-w-xs">Aún no estás matriculado en ningún curso. Pídele al administrador que te inscriba.</p>
      </div>
    );
  }

  return (
    <CourseDetail 
      courseId={firstCourseId} 
      onBack={() => {}} 
      onEnter={onEnter} 
      onSelectRelated={onCourseSelect} 
      isEmbedded={true}
    />
  );
}
