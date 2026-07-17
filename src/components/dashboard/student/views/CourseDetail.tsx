import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, BarChart3, BookOpen, ChevronDown, Play, FileText, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { getCourseById, type Module } from '../../../../lib/courses';
import { enrollInCourse, isEnrolled, getEnrollmentAccess } from '../../../../lib/enrollments';
import { supabase } from '../../../../lib/supabase';
import toast from 'react-hot-toast';
import { MagneticButton } from '../../../effects/MagneticButton';
import { RevealHeading } from '../../../effects/RevealHeading';
import { StarfieldBackground } from '../../../effects/StarfieldBackground';

interface Props {
  courseId: string;
  onBack: () => void;
  onEnter: (courseId: string) => void;
  onSelectRelated: (courseId: string) => void;
  isEmbedded?: boolean;
}

interface Instructor {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface RelatedCourse {
  id: string;
  title: string;
  cover_url: string | null;
  duration_hrs: number;
  level: string;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function CourseDetail({ courseId, onBack, onEnter, onSelectRelated, isEmbedded }: Props) {
  const [course, setCourse] = useState<any>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [related, setRelated] = useState<RelatedCourse[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [accessPending, setAccessPending] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getCourseById(courseId);
        if (cancelled) return;
        setCourse(data);

        if (data.created_by) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, bio')
            .eq('id', data.created_by)
            .maybeSingle();
          if (!cancelled) setInstructor(prof);
        }

        if (data.category_id) {
          const { data: rel } = await supabase
            .from('courses')
            .select('id, title, cover_url, duration_hrs, level')
            .eq('category_id', data.category_id)
            .eq('published', true)
            .neq('id', courseId)
            .limit(4);
          if (!cancelled) setRelated((rel as RelatedCourse[]) ?? []);
        }

        const already = await isEnrolled(courseId);
        if (!cancelled) setEnrolled(already);
        if (already) {
          const hasAccess = await getEnrollmentAccess(courseId);
          if (!cancelled) setAccessPending(!hasAccess);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePrimaryAction = async () => {
    if (enrolled) {
      if (accessPending) {
        toast('Tu inscripción sigue pendiente de aprobación por un administrador.', { icon: '⏳' });
        return;
      }
      onEnter(courseId);
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      setEnrolled(true);
      setAccessPending(true);
      toast.success('Solicitud enviada. Un administrador debe aprobar tu acceso antes de que puedas ver el contenido.');
    } catch (e: any) {
      toast.error(e.message?.includes('unique') ? 'Ya estás inscrito en este curso' : 'No se pudo completar la inscripción');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className={`relative min-h-full p-6 lg:p-8 overflow-hidden ${isEmbedded ? '' : 'bg-[#05070f]'}`}>
        {!isEmbedded && <StarfieldBackground density={0.6} />}
        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
          <div className="h-40 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`flex h-full items-center justify-center text-slate-400 ${isEmbedded ? '' : 'bg-[#05070f]'}`}>
        Curso no encontrado.
      </div>
    );
  }

  const modules: Module[] = (course.modules ?? []).slice().sort((a: Module, b: Module) => a.position - b.position);
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0);

  return (
    <div className={`relative min-h-full text-white overflow-hidden ${isEmbedded ? '' : 'bg-[#05070f]'}`}>
      {!isEmbedded && <StarfieldBackground density={0.9} />}

      {/* Topbar */}
      {!isEmbedded && (
        <div className="relative z-10 flex items-center gap-4 px-4 lg:px-8 h-14 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto p-4 lg:p-8 space-y-10">

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="lg:col-span-7 space-y-5"
          >
            {course.categories?.name && (
              <span className="sticker inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white" style={{ background: 'var(--gradient-brand)' }}>
                {course.categories.name}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-300 leading-relaxed">
              {course.long_desc || course.description || 'Sin descripción disponible.'}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-sky-400" />
                <span className="capitalize">{LEVEL_LABELS[course.level] ?? course.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-sky-400" />
                <span>{course.duration_hrs}h de contenido</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-sky-400" />
                <span>{totalLessons} lecciones · {modules.length} módulos</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
              <div className="h-44 bg-white/5 overflow-hidden">
                {course.cover_url ? (
                  <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={36} className="text-white/20" />
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                {course.price > 0 && (
                  <p className="text-2xl font-black text-white">${course.price}</p>
                )}
                <MagneticButton
                  onClick={handlePrimaryAction}
                  disabled={enrolling}
                  className="pulse-glow bg-gradient-primary w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow disabled:opacity-60"
                  strength={0.15}
                >
                  {enrolling ? 'Inscribiendo...' : enrolled ? (accessPending ? 'Pendiente de aprobación' : 'Continuar curso') : 'Inscribirme'}
                </MagneticButton>
                {enrolled && (
                  accessPending ? (
                    <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Clock size={13} /> Esperando aprobación del administrador
                    </p>
                  ) : (
                    <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={13} /> Ya estás inscrito
                    </p>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Curriculum */}
        <div>
          <RevealHeading as="div" className="text-lg font-black text-white mb-4">Contenido del curso</RevealHeading>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden divide-y divide-white/10">
            {modules.map((mod, mIdx) => {
              const isOpen = openModules.has(mod.id);
              const lessons = (mod.lessons ?? []).slice().sort((a, b) => a.position - b.position);
              return (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="w-6 h-6 rounded-md bg-sky-400/10 border border-sky-400/25 flex items-center justify-center shrink-0 text-[10px] font-black text-sky-300">
                      {mIdx + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-white">{mod.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{lessons.length} sesión{lessons.length !== 1 ? 'es' : ''}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-slate-400 shrink-0">
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 space-y-1">
                          {lessons.map((lesson, lIdx) => (
                            <div key={lesson.id} className="flex items-center gap-2.5 pl-9 py-1.5">
                              <span className="text-xs text-slate-300 flex-1 line-clamp-1">
                                {lIdx + 1}. {lesson.title}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
                                {lesson.video_url && <Play size={11} />}
                                {lesson.pdf_url && <FileText size={11} />}
                                {lesson.duration_min > 0 && <span className="text-[10px]">{lesson.duration_min}m</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructor */}
        {instructor && (instructor.full_name || instructor.bio) && (
          <div>
            <RevealHeading as="div" className="text-lg font-black text-white mb-4">Tu instructor</RevealHeading>
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sky-400/10 border border-sky-400/25 flex items-center justify-center shrink-0 overflow-hidden">
                {instructor.avatar_url ? (
                  <img src={instructor.avatar_url} alt={instructor.full_name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={22} className="text-sky-300" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{instructor.full_name ?? 'Instructor'}</p>
                {instructor.bio && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{instructor.bio}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Related courses */}
        {related.length > 0 && (
          <div>
            <RevealHeading as="div" className="text-lg font-black text-white mb-4">Cursos relacionados</RevealHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(r => (
                <button
                  key={r.id}
                  onClick={() => onSelectRelated(r.id)}
                  className="text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden card-glow card-glow-brand"
                >
                  <div className="h-24 bg-white/5 overflow-hidden">
                    {r.cover_url ? (
                      <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={20} className="text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-white line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{r.duration_hrs}h · {LEVEL_LABELS[r.level] ?? r.level}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
