import { useState, useEffect, useMemo, type ReactNode, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, ListChecks, Target, ChevronDown, ChevronRight, Lock, FileCode, Presentation, FileDown, DownloadCloud, PanelLeft, Eye, Copy, StickyNote, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../lib/supabase';
import { markLessonComplete, markLessonIncomplete, getCompletedLessonIds } from '../../../../lib/enrollments';
import { getTopicFeedback, setTopicStatus, type TopicStatus } from '../../../../lib/topicFeedback';

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

const parseStructuredContent = (content?: string | null): { description?: string; temas: string[]; alcances: string[] } | null => {
  if (!content) return null;
  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed.type === 'structured') {
        return { description: parsed.description, temas: parsed.temas ?? [], alcances: parsed.alcances ?? [] };
      }
    }
  } catch (e) {}
  return null;
};

export function LessonViewer({ courseId, onBack }: Props) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [viewingFile, setViewingFile] = useState<{ url: string; viewerUrl: string; name: string } | null>(null);
  const structuredContent = useMemo(() => parseStructuredContent(activeLesson?.content ?? null), [activeLesson?.id]);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('courses')
          .select('id, title, cover_url, modules(id, title, position, lessons(id, title, content, video_url, pdf_url, duration_min, position, is_free))')
          .eq('id', courseId)
          .single();

        if (data) {
          // Sort modules and lessons by position
          const sortedModules = (data.modules as Module[])
            .sort((a, b) => a.position - b.position)
            .map(m => ({ ...m, lessons: m.lessons.sort((a, b) => a.position - b.position) }));
          
          setCourse({ ...data, modules: sortedModules } as unknown as CourseData);

          // Initial load without opening the first module
          const firstModule = sortedModules[0];
          if (firstModule) {
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
        flex flex-col shrink-0 h-full bg-lms-surface border-r border-lms-border overflow-hidden
        fixed lg:relative z-30 transition-all duration-300
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0'}
        ${desktopSidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:border-transparent'}
      `}>
        <div className="w-72 h-full flex flex-col">
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
          {course.modules.map((mod, mIdx) => {
            const isModOpen = openModules.has(mod.id);
            return (
              <div key={mod.id} className="mb-1">
                <motion.button
                  onClick={() => toggleModule(mod.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mx-2 transition-colors group ${
                    isModOpen ? 'bg-lms-hover/80' : 'hover:bg-lms-hover/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <motion.span
                      animate={{ color: isModOpen ? '#22d3ee' : '#64748b' }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] font-black shrink-0"
                    >
                      M{mIdx + 1}
                    </motion.span>
                    <span className={`text-xs font-bold text-left transition-colors ${
                      isModOpen ? 'text-lms-text-primary' : 'text-lms-text-muted'
                    }`}>
                      {mod.title}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isModOpen ? 90 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="shrink-0 text-lms-text-muted"
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isModOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-2 pt-1">
                        {mod.lessons.map((lesson, lIdx) => {
                          const isActive = activeLesson?.id === lesson.id;
                          const isDone = completed.has(lesson.id);
                          return (
                            <motion.button
                              key={lesson.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: lIdx * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                              onClick={() => { setActiveLesson(lesson); setSidebarOpen(false); }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.97 }}
                              className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 transition-all text-left rounded-xl mx-2 mb-0.5 ${
                                isActive
                                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                                  : 'hover:bg-lms-hover/60'
                              }`}
                            >
                              <div className="shrink-0">
                                <AnimatePresence mode="wait" initial={false}>
                                  {isDone ? (
                                    <motion.div key="done" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                                      <CheckCircle size={15} className="text-emerald-400" />
                                    </motion.div>
                                  ) : isActive ? (
                                    <motion.div key="active" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500 }}>
                                      <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                      <Circle size={15} className="text-lms-text-muted/40" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold transition-colors ${
                                  isActive ? 'text-cyan-400' : isDone ? 'text-lms-text-muted' : 'text-lms-text-primary'
                                }`}>
                                  {lIdx + 1}. {lesson.title}
                                </p>
                                {lesson.duration_min > 0 && (
                                  <p className="text-[10px] text-lms-text-muted mt-0.5">{lesson.duration_min} min</p>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {viewingFile ? (
          <FileNotesPage file={viewingFile} onBack={() => setViewingFile(null)} />
        ) : (
        <>
        {/* Lesson topbar */}
        <div className="flex items-center gap-4 px-4 lg:px-6 h-14 bg-lms-surface border-b border-lms-border shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 text-xs text-lms-text-muted hover:text-lms-text-primary font-semibold shrink-0"
          >
            <BookOpen size={15} /> Índice
          </button>
          
          <button
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            className="hidden lg:flex items-center text-lms-text-muted hover:text-lms-text-primary transition-colors shrink-0"
            title={desktopSidebarOpen ? "Ocultar Índice" : "Mostrar Índice"}
          >
            <PanelLeft size={20} />
          </button>
          
          <h3 className="text-sm font-bold text-lms-text-primary truncate flex-1">
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
            <div className="max-w-4xl mx-auto space-y-5">

              {/* Video Player */}
              {activeLesson.video_url && (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg shadow-black/10">
                  <iframe
                    src={activeLesson.video_url}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {activeLesson.content && (
                structuredContent ? (
                  <>
                    {structuredContent.description && (
                      <div className="bg-lms-surface border border-lms-border rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="text-sm md:text-base text-lms-text-primary leading-relaxed">
                          {structuredContent.description}
                        </div>
                      </div>
                    )}

                    {structuredContent.temas.length > 0 && (
                      <CollapsibleSection
                        key={`${activeLesson.id}-temas`}
                        icon={ListChecks}
                        iconClass="bg-cyan-500/10 text-cyan-500"
                        title="Temas a cubrir"
                        count={structuredContent.temas.length}
                      >
                        <ul className="space-y-3 m-0 p-0 list-none">
                          {structuredContent.temas.map((tema, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-lms-text-primary leading-relaxed">
                              <span className="text-cyan-400 mt-0.5 font-bold">•</span>
                              <span>{tema}</span>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>
                    )}

                    {structuredContent.alcances.length > 0 && (
                      <CollapsibleSection
                        key={`${activeLesson.id}-alcances`}
                        icon={Target}
                        iconClass="bg-emerald-500/10 text-emerald-500"
                        title="Alcances"
                        count={structuredContent.alcances.length}
                      >
                        <ul className="space-y-3 m-0 p-0 list-none">
                          {structuredContent.alcances.map((alcance, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-lms-text-primary leading-relaxed">
                              <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                              <span>{alcance}</span>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleSection>
                    )}
                  </>
                ) : (
                  <div className="prose prose-slate prose-sm md:prose-base max-w-none bg-lms-surface border border-lms-border rounded-2xl p-6 md:p-8 shadow-sm text-slate-700">
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                )
              )}

              {/* Material Descargable */}
              {activeLesson.pdf_url && (() => {
                const urls = activeLesson.pdf_url.split(',').map(u => u.trim()).filter(Boolean);
                return (
                  <CollapsibleSection
                    key={`${activeLesson.id}-material`}
                    icon={FileDown}
                    iconClass="bg-indigo-500/10 text-indigo-500"
                    title="Material Descargable"
                    count={urls.length}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {urls.map((url, idx) => {
                        const meta = getFileMeta(url);
                        if (!meta) return null;

                        const rawName = url.split('/').pop() || `Archivo ${urls.length > 1 ? idx + 1 : ''}`;
                        const decodedName = decodeURIComponent(rawName);
                        const displayName = decodedName.replace(/^\d+-/, '');

                        const lowerUrl = url.toLowerCase();
                        let viewerUrl = url;
                        if (meta.type === 'ppt' || lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.xlsx') || lowerUrl.includes('.docx?') || lowerUrl.includes('.xlsx?')) {
                           viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
                        } else if (meta.type !== 'pdf') {
                           viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
                        }

                        return (
                          <div key={idx} className="rounded-xl border border-lms-border bg-lms-bg p-4 flex flex-col gap-3 card-glow card-glow-cyan">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-cyan-50 flex items-center justify-center border border-cyan-100">
                                <meta.icon size={20} className="text-cyan-500" />
                              </div>
                              <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-sm font-bold text-slate-700 truncate" title={decodedName}>
                                  {displayName}
                                </h4>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  Archivo descargable
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <button
                                onClick={() => setViewingFile({ url, viewerUrl, name: displayName })}
                                className="inline-flex items-center justify-center gap-2 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 text-cyan-700 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors w-full"
                              >
                                <Eye size={16} /> Ver Archivo
                              </button>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors w-full"
                              >
                                <DownloadCloud size={16} /> Descargar
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                );
              })()}

              {structuredContent && structuredContent.temas.length > 0 && (
                <TopicKanban key={activeLesson.id} lessonId={activeLesson.id} temas={structuredContent.temas} />
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
        </>
        )}
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

function CollapsibleSection({ icon: Icon, iconClass, title, count, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-lms-surface border border-lms-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300 hover:border-cyan-500/30">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 md:p-6 hover:bg-lms-hover/30 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon size={16} />
        </div>
        <span className="flex-1 text-sm font-bold text-lms-text-primary">{title}</span>
        {count !== undefined && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lms-hover text-lms-text-muted">{count}</span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="shrink-0 text-lms-text-muted">
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 pt-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileNotesPageProps {
  file: { url: string; viewerUrl: string; name: string };
  onBack: () => void;
}

function FileNotesPage({ file, onBack }: FileNotesPageProps) {
  const storageKey = `openview:file-notes:${file.url}`;
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(localStorage.getItem(storageKey) ?? '');
  }, [storageKey]);

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(storageKey, notes), 400);
    return () => clearTimeout(id);
  }, [storageKey, notes]);

  const copyNotes = async () => {
    if (!notes.trim()) {
      toast.error('No hay notas para copiar');
      return;
    }
    try {
      await navigator.clipboard.writeText(notes);
      toast.success('Notas copiadas al portapapeles');
    } catch (e) {
      toast.error('No se pudieron copiar las notas');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center gap-4 px-4 lg:px-6 h-14 bg-lms-surface border-b border-lms-border shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-lms-text-muted hover:text-cyan-400 font-semibold transition-colors shrink-0"
        >
          <ArrowLeft size={14} /> Volver a la lección
        </button>
        <h3 className="text-sm font-bold text-lms-text-primary truncate flex-1">{file.name}</h3>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-lms-text-muted hover:text-lms-text-primary transition-colors"
        >
          <DownloadCloud size={14} /> Descargar
        </a>
      </div>

      {/* Body: viewer + notes */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 h-full min-h-[50vh] bg-slate-100 border-b lg:border-b-0 lg:border-r border-lms-border">
          <iframe src={file.viewerUrl} title={file.name} className="w-full h-full border-0" />
        </div>

        <div className="lg:col-span-4 h-full flex flex-col p-4 gap-3 bg-lms-surface">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lms-text-muted">
              <StickyNote size={14} /> Mis notas
            </h4>
            <button
              onClick={copyNotes}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
            >
              <Copy size={13} /> Copiar
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe aquí tus notas mientras revisas el archivo..."
            className="flex-1 w-full resize-none rounded-xl border border-lms-border bg-lms-bg p-3 text-sm text-lms-text-primary placeholder:text-lms-text-muted/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <p className="text-[10px] text-lms-text-muted">Tus notas se guardan automáticamente en este dispositivo.</p>
        </div>
      </div>
    </div>
  );
}

const KANBAN_COLUMNS: { status: TopicStatus; label: string; icon: typeof HelpCircle; accent: string; dot: string }[] = [
  { status: 'pending', label: 'Por revisar', icon: HelpCircle, accent: 'border-lms-border', dot: 'bg-slate-400' },
  { status: 'understood', label: 'Entendido', icon: ThumbsUp, accent: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  { status: 'not_understood', label: 'No entendido', icon: ThumbsDown, accent: 'border-rose-500/30', dot: 'bg-rose-500' },
];

interface TopicKanbanProps {
  lessonId: string;
  temas: string[];
}

function TopicKanban({ lessonId, temas }: TopicKanbanProps) {
  const [statuses, setStatuses] = useState<Map<number, TopicStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TopicStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTopicFeedback(lessonId)
      .then(map => { if (!cancelled) setStatuses(map); })
      .catch(() => { if (!cancelled) toast.error('No se pudo cargar tu feedback de temas'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lessonId]);

  const moveTopic = async (idx: number, status: TopicStatus) => {
    setStatuses(prev => new Map(prev).set(idx, status));
    try {
      await setTopicStatus(lessonId, idx, temas[idx], status);
    } catch (e) {
      toast.error('No se pudo guardar tu feedback');
    }
  };

  const handleDrop = (status: TopicStatus) => {
    setDragOverStatus(null);
    if (draggedIdx === null) return;
    moveTopic(draggedIdx, status);
    setDraggedIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-lms-text-muted flex items-center gap-2">
          <StickyNote size={14} /> ¿Qué tan claros quedaron los temas?
        </h3>
        {!loading && (
          <span className="text-[10px] text-lms-text-muted">
            Arrastra una tarjeta o usa los botones
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {KANBAN_COLUMNS.map(col => {
          const items = temas
            .map((tema, idx) => ({ tema, idx }))
            .filter(({ idx }) => (statuses.get(idx) ?? 'pending') === col.status);

          return (
            <div
              key={col.status}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(col.status); }}
              onDragLeave={() => setDragOverStatus(prev => (prev === col.status ? null : prev))}
              onDrop={(e) => { e.preventDefault(); handleDrop(col.status); }}
              className={`rounded-2xl border ${col.accent} bg-lms-surface p-3 min-h-[140px] transition-colors ${
                dragOverStatus === col.status ? 'bg-cyan-500/5 ring-2 ring-cyan-500/30' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <col.icon size={14} className="text-lms-text-muted" />
                <span className="text-xs font-bold text-lms-text-primary">{col.label}</span>
                <span className="ml-auto text-[10px] font-semibold text-lms-text-muted">{items.length}</span>
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {items.map(({ tema, idx }) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      draggable
                      onDragStart={() => setDraggedIdx(idx)}
                      onDragEnd={() => setDraggedIdx(null)}
                      className={`group rounded-xl border border-lms-border bg-lms-bg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:border-cyan-500/30 transition-colors ${
                        draggedIdx === idx ? 'opacity-40' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-lms-text-primary leading-snug">{tema}</p>
                      <div className="flex items-center gap-1 mt-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {KANBAN_COLUMNS.filter(c => c.status !== col.status).map(c => (
                          <button
                            key={c.status}
                            onClick={() => moveTopic(idx, c.status)}
                            title={`Mover a "${c.label}"`}
                            className="p-1.5 rounded-lg hover:bg-lms-hover text-lms-text-muted hover:text-lms-text-primary transition-colors"
                          >
                            <c.icon size={12} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="text-[10px] text-lms-text-muted/60 text-center py-4">Sin tarjetas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
