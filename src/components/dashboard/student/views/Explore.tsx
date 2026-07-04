import { useState, useEffect } from 'react';
import { Course, getCourses } from '../../../../lib/courses';
import { CourseCard } from '../../shared/CourseCard';
import { Search } from 'lucide-react';

export function Explore() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses(true).then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Explorar</h1>
          <p className="text-slate-500">Descubre nuevas rutas de aprendizaje</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar cursos..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Cargando catálogo...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              actionLabel="Ver Detalles"
            />
          ))}
        </div>
      )}
    </div>
  );
}
