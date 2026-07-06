import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, Play, ChevronDown, ChevronRight, Lock, FileCode, Presentation, FileDown, DownloadCloud } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { markLessonComplete, markLessonIncomplete, getCompletedLessonIds } from '../../../../lib/enrollments';

interface Props {
  courseId: string;
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  pdf_url?: string | null;
  duration_min: number;
  position: number;
  is_free: boolean;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  cover_url: string | null;
  modules: Module[];
}

const getFileMeta = (url?: string | null) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?')) return { type: 'pdf', icon: FileText, label: 'Documento PDF' };
  if (lowerUrl.endsWith('.pptx') || lowerUrl.endsWith('.ppt') || lowerUrl.includes('.ppt')) return { type: 'ppt', icon: Presentation, label: 'Presentación PPTX' };
  if (lowerUrl.endsWith('.ipynb') || lowerUrl.includes('.ipynb')) return { type: 'code', icon: FileCode, label: 'Notebook Colab / IPYNB' };
  return { type: 'other', icon: FileDown, label: 'Archivo Adjunto' };
};

export function LessonViewer({ courseId, onBack }: Props) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('courses')
          .select('id, title, cover_url, modules(id, title, position, lessons(id, title, content, video_url, duration_min, position, is_free))')
          .eq('id', courseId)
          .single();

        if (data) {
          // Sort modules and lessons by position
          data.modules = (data.modules as Module[])
            .sort((a, b) => a.position - b.position)
            .map(m => ({ ...m, lessons: m.lessons.sort((a, b) => a.position - b.position) }));
          
          setCourse(data as unknown as CourseData);

          // Open first module, select first lesson
          const firstModule = data.modules[0];
          if (firstModule) {
            setOpenModules(new Set([firstModule.id]));
            if (firstModule.lessons?.[0]) {
              setActiveLesson(firstModule.lessons[0]);
            }
          }
        }

        const completedIds = await getCompletedLessonIds(courseId);
        setCompleted(completedIds);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleComplete = async (lessonId: string) => {
    try {
      if (completed.has(lessonId)) {
        await markLessonIncomplete(lessonId);
        setCompleted(prev => { const n = new Set(prev); n.delete(lessonId); return n; });
      } else {
        await markLessonComplete(lessonId);
        setCompleted(prev => new Set([...prev, lessonId]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate total progress
  const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-lms-bg">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center bg-lms-bg text-lms-text-muted">
        Curso no encontrado.
      </div>
    );
  }

  return (
    <div className="flex h-full bg-lms-bg overflow-hidden">

      {/* ── Sidebar: Course Index ── */}
      <aside className={`
        flex flex-col w-72 shrink-0 h-full bg-lms-surface border-r border-lms-border overflow-hidden
        fixed lg:relative z-30 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Course header */}
        <div className="p-4 border-b border-lms-border">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-lms-text-muted hover:text-cyan-400 font-semibold transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Volver a mis cursos
          </button>
          <h2 className="text-sm font-black text-lms-text-primary line-clamp-2">{course.title}</h2>
          {/* Progress */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-lms-text-muted">Tu progreso</span>
              <span className="text-cyan-400 font-bold">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-lms-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-lms-text-muted">{completed.size} de {totalLessons} lecciones completadas</p>
          </div>
        </div>

        {/* Module / Lesson list */}
        <div className="flex-1 overflow-y-auto py-2">
          {course.modules.map((mod, mIdx) => (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-lms-hover transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-black text-lms-text-muted shrink-0">M{mIdx + 1}</span>
                  <span className="text-xs font-bold text-lms-text-primary text-left line-clamp-1">{mod.title}</span>
                </div>
                {openModules.has(mod.id)
                  ? <ChevronDown size={14} className="text-lms-text-muted shrink-0" />
                  : <ChevronRight size={14} className="text-lms-text-muted shrink-0" />
                }
              </button>

              {openModules.has(mod.id) && (
                <div className="pb-2">
                  {mod.lessons.map((lesson, lIdx) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = completed.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 transition-all text-left group ${
                          isActive
                            ? 'bg-cyan-500/10 border-r-2 border-cyan-500'
                            : 'hover:bg-lms-hover'
                        }`}
                      >
                        <div className="shrink-0">
                          {isDone
                            ? <CheckCircle size={15} className="text-emerald-400" />
                            : isActive
                              ? <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                </div>
                              : <Circle size={15} className="text-lms-text-muted/40" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-cyan-400' : isDone ? 'text-lms-text-muted' : 'text-lms-text-primary'}`}>
                            {lIdx + 1}. {lesson.title}
                          </p>
                          {lesson.duration_min > 0 && (
                            <p className="text-[10px] text-lms-text-muted mt-0.5">{lesson.duration_min} min</p>
                          )}
                        </div>
                        {(() => {
                          if (!lesson.pdf_url) return null;
                          const urls = lesson.pdf_url.split(',').map(u => u.trim()).filter(Boolean);
                          return urls.map((url, i) => {
                            const meta = getFileMeta(url);
                            return meta && <meta.icon key={i} size={11} className="text-lms-text-muted shrink-0" />;
                          });
                        })()}
                        {lesson.video_url && <Play size={11} className="text-lms-text-muted shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Lesson topbar */}
        <div className="flex items-center justify-between px-4 lg:px-6 h-14 bg-lms-surface border-b border-lms-border shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 text-xs text-lms-text-muted hover:text-lms-text-primary font-semibold"
          >
            <BookOpen size={15} /> Índice
          </button>
          <h3 className="text-sm font-bold text-lms-text-primary truncate px-4">
            {activeLesson?.title ?? 'Selecciona una lección'}
          </h3>
          {activeLesson && (
            <button
              onClick={() => toggleComplete(activeLesson.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                completed.has(activeLesson.id)
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-lms-hover text-lms-text-muted hover:text-lms-text-primary border border-lms-border'
              }`}
            >
              {completed.has(activeLesson.id)
                ? <><CheckCircle size={13} /> Completada</>
                : <><Circle size={13} /> Marcar lista</>
              }
            </button>
          )}
        </div>

        {/* Lesson body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {!activeLesson ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-lms-text-muted gap-4">
              <BookOpen size={40} className="opacity-20" />
              <p className="text-sm">Selecciona una lección del panel izquierdo para comenzar</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-black text-lms-text-primary">{activeLesson.title}</h2>

              {/* Video Player */}
              {activeLesson.video_url && (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                  <iframe
                    src={activeLesson.video_url}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {/* Attachment Viewer / Download */}
              {(() => {
                if (!activeLesson.pdf_url) return null;
                const urls = activeLesson.pdf_url.split(',').map(u => u.trim()).filter(Boolean);

                return (
                  <div className="space-y-4">
                    {urls.map((url, idx) => {
                      const meta = getFileMeta(url);
                      if (!meta) return null;

                      if (meta.type === 'pdf') {
                        return (
                          <div key={idx} className="rounded-2xl overflow-hidden border border-lms-border bg-lms-surface">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-lms-border">
                              <meta.icon size={15} className="text-cyan-400" />
                              <span className="text-xs font-bold text-lms-text-muted uppercase tracking-wider">{meta.label}</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                              >
                                Abrir en nueva pestaña <DownloadCloud size={12} />
                              </a>
                            </div>
                            <iframe
                              src={url}
                              title={`Material - ${activeLesson.title} - ${idx + 1}`}
                              className="w-full h-[70vh]"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="rounded-2xl border border-lms-border bg-lms-surface p-6 flex flex-col items-center justify-center text-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                            <meta.icon size={32} className="text-cyan-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-lms-text-primary mb-1">Archivo {urls.length > 1 ? idx + 1 : ''} disponible</h4>
                            <p className="text-xs text-lms-text-muted">Este es un archivo {meta.label.toLowerCase()} que puedes descargar.</p>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20"
                          >
                            <DownloadCloud size={16} /> Descargar Archivo
                          </a>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Text Content */}
              {activeLesson.content && (
                <div className="prose prose-invert prose-sm max-w-none bg-lms-surface border border-lms-border rounded-2xl p-6">
                  <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                </div>
              )}

              {!activeLesson.video_url && !activeLesson.pdf_url && !activeLesson.content && (
                <div className="flex flex-col items-center justify-center py-16 bg-lms-surface border border-lms-border rounded-2xl text-lms-text-muted gap-3">
                  <Lock size={32} className="opacity-20" />
                  <p className="text-sm">Esta lección aún no tiene contenido.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-lms-border">
                {/* Previous lesson */}
                {(() => {
                  const allLessons = course?.modules.flatMap(m => m.lessons) ?? [];
                  const idx = allLessons.findIndex(l => l.id === activeLesson.id);
                  const prev = idx > 0 ? allLessons[idx - 1] : null;
                  const next = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
                  return (
                    <>
                      <button
                        onClick={() => prev && setActiveLesson(prev)}
                        disabled={!prev}
                        className="flex items-center gap-2 text-sm font-semibold text-lms-text-muted hover:text-lms-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowLeft size={16} /> Anterior
                      </button>
                      <button
                        onClick={() => {
                          if (!completed.has(activeLesson.id)) toggleComplete(activeLesson.id);
                          if (next) setActiveLesson(next);
                        }}
                        disabled={!next}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/20"
                      >
                        {next ? 'Siguiente lección' : '¡Curso completado!'} <ChevronRight size={16} />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
