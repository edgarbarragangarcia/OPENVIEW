import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, Clock, BookOpen, ChevronDown, Play, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCourses, Course } from '../lib/courses';

interface LessonPreview { id: string; title: string; position: number; duration_min: number; video_url: string | null; pdf_url: string | null; }
interface ModulePreview { id: string; title: string; position: number; lessons: LessonPreview[]; }
interface CourseWithModules extends Course { modules?: ModulePreview[]; }

function CourseCard({ course, idx }: { course: CourseWithModules; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const modules = course.modules?.sort((a, b) => a.position - b.position) ?? [];

  return (
    <motion.div
      key={course.id}
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.12 }}
      className="group flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] card-glow card-glow-brand transition-all duration-500"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-slate-200 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {course.cover_url ? (
          <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
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
        {/* Hover overlay hint */}
        {modules.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
            <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <ChevronDown size={13} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Ocultar temario' : 'Ver temario completo'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-8">
        <h3
          className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {course.title}
        </h3>

        <p className="text-slate-500 font-medium mb-6 line-clamp-2">
          {course.description || 'Sin descripción'}
        </p>

        {/* Footer row */}
        <div className="mt-auto pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="capitalize">{course.level}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{course.duration_hrs} Horas</span>
            </div>
          </div>
          {modules.length > 0 && (
            <motion.button
              onClick={() => setExpanded(!expanded)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <ChevronDown size={14} />
              </motion.div>
              {expanded ? 'Ocultar' : `Ver ${modules.length} módulo${modules.length !== 1 ? 's' : ''}`}
            </motion.button>
          )}
        </div>

        {/* Expanded roadmap */}
        <AnimatePresence initial={false}>
          {expanded && modules.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ruta de aprendizaje</p>
                {modules.map((mod, mIdx) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mIdx * 0.07, type: 'spring', stiffness: 380, damping: 28 }}
                    className="space-y-2"
                  >
                    {/* Module header */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-sky-600">{mIdx + 1}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{mod.title}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">{mod.lessons.length} sesión{mod.lessons.length !== 1 ? 'es' : ''}</span>
                    </div>

                    {/* Lesson list */}
                    <div className="pl-8 space-y-1.5">
                      {mod.lessons.sort((a, b) => a.position - b.position).map((lesson, lIdx) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: mIdx * 0.07 + lIdx * 0.035, type: 'spring', stiffness: 400, damping: 30 }}
                          className="flex items-center gap-2 group/lesson"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/lesson:bg-sky-400 transition-colors shrink-0" />
                          <span className="text-xs text-slate-600 line-clamp-1 flex-1">
                            {lIdx + 1}. {lesson.title}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 opacity-60">
                            {lesson.video_url && <Play size={9} className="text-slate-500" />}
                            {lesson.pdf_url && <FileText size={9} className="text-slate-500" />}
                            {lesson.duration_min > 0 && (
                              <span className="text-[9px] text-slate-400">{lesson.duration_min}m</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface CourseGridProps {
  selectedCategoryId?: number | null;
  onClearFilter?: () => void;
}

export function CourseGrid({ selectedCategoryId = null, onClearFilter }: CourseGridProps) {
  const [courses, setCourses] = useState<CourseWithModules[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses(true);

        // Fetch modules + lessons for each course
        const withModules = await Promise.all(data.map(async (course) => {
          const { data: modulesData } = await supabase
            .from('modules')
            .select('id, title, position, lessons(id, title, position, duration_min, video_url, pdf_url)')
            .eq('course_id', course.id)
            .order('position');
          return { ...course, modules: (modulesData ?? []) as unknown as ModulePreview[] };
        }));

        setCourses(withModules);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = selectedCategoryId
    ? courses.filter(c => c.category_id === selectedCategoryId)
    : courses;
  const filteredCategoryName = selectedCategoryId
    ? courses.find(c => c.category_id === selectedCategoryId)?.categories?.name
    : null;

  return (
    <section id="cursos" className="py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              {filteredCategoryName ?? 'Programas'} <br />
              <span className="text-gradient italic font-black">{filteredCategoryName ? 'Cursos' : 'Ejecutivos'}</span>
            </h2>
          </div>
          {selectedCategoryId ? (
            <button
              onClick={onClearFilter}
              className="group flex items-center gap-3 text-slate-900 font-bold tracking-widest uppercase text-sm border-b-2 border-primary-light pb-2 hover:text-primary transition-colors"
            >
              Ver Catálogo Completo
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 text-primary transition-transform" />
            </button>
          ) : (
            <div className="text-slate-400 text-sm font-medium">{filtered.length} curso{filtered.length !== 1 ? 's' : ''} disponibles</div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-100 rounded-[2rem] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Próximamente</h3>
            <p className="text-slate-500">Estamos preparando nuevos programas ejecutivos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((course, idx) => (
              <CourseCard key={course.id} course={course} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
