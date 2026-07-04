import { motion } from 'motion/react';
import { ArrowRight, Calendar, Clock, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCourses, Course } from '../lib/courses';

export function CourseGrid() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch only published courses for the landing page
        const data = await getCourses(true);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              Programas <br />
              <span className="text-gradient italic font-black">Ejecutivos</span>
            </h2>
          </div>
          <button className="group flex items-center gap-3 text-slate-900 font-bold tracking-widest uppercase text-sm border-b-2 border-primary-light pb-2 hover:text-primary transition-colors">
            Ver Catálogo Completo 
            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 text-primary transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold">Cargando catálogo...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Próximamente</h3>
            <p className="text-slate-500">Estamos preparando nuevos programas ejecutivos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group cursor-pointer flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.1)] transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-slate-200">
                  {course.cover_url ? (
                    <img
                      src={course.cover_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <BookOpen size={48} />
                    </div>
                  )}
                  {course.categories?.name && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary-dark text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                      {course.categories.name}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-8">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 font-medium mb-8 line-clamp-2">
                    {course.description || 'Sin descripción'}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-4">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{course.duration_hrs} Horas</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
