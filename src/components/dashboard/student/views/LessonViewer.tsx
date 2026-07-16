import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, Circle, BookOpen, FileText, ChevronDown, ChevronRight, Lock, FileCode, Presentation, FileDown, DownloadCloud, PanelLeft, Eye, Copy, StickyNote, HelpCircle, ThumbsUp, ThumbsDown, Workflow, Target, Flag, Package, MessageSquare, DollarSign, Users, ClipboardList, ShoppingCart, Sparkles, X, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../lib/supabase';
import { markLessonComplete, markLessonIncomplete, getCompletedLessonIds } from '../../../../lib/enrollments';
import { getTopicFeedback, setTopicStatus, type TopicStatus } from '../../../../lib/topicFeedback';
import { saveQuizResult } from '../../../../lib/quizResults';
import { ProcessCanvas } from './ProcessCanvas';
import { CanvasListView } from './CanvasListView';

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

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const parseStructuredContent = (content?: string | null): { description?: string; temas: string[]; alcances: string[]; quiz: QuizQuestion[] } | null => {
  if (!content) return null;
  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      if (parsed.type === 'structured') {
        return { description: parsed.description, temas: parsed.temas ?? [], alcances: parsed.alcances ?? [], quiz: parsed.quiz ?? [] };
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
  const [canvasView, setCanvasView] = useState<'list' | { canvasId: string } | null>(null);
  const showCanvas = canvasView !== null;
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
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar tu progreso');
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
        fixed lg:relative z-30 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0'}
        ${desktopSidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:border-transparent'}
      `}>
        <div className="w-72 h-full flex flex-col">

          {/* Logo header — same as StudentDashboard */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-lms-border shrink-0">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Open View Logo" className="w-14 h-14 object-contain rounded-lg mix-blend-multiply" />
              <div>
                <p className="font-black text-sm text-lms-text-primary leading-none mb-1">OpenView</p>
                <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest leading-none">Academia</p>
              </div>
            </div>
            <button onClick={onBack} className="flex items-center gap-1 text-[10px] font-bold text-lms-text-muted hover:text-cyan-400 transition-colors">
              <ArrowLeft size={12} /> Salir
            </button>
          </div>

          {/* Course header */}
          <div className="px-5 py-4 border-b border-lms-border">
            <p className="text-[10px] font-bold uppercase tracking-widest text-lms-text-muted mb-1">Curso actual</p>
            <h2 className="text-sm font-sans font-black text-lms-text-primary line-clamp-2 leading-snug">{course.title}</h2>
            {/* Progress */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-lms-text-muted font-semibold">Tu progreso</span>
                <span className="text-cyan-400 font-black">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-lms-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-lms-text-muted">{completed.size} de {totalLessons} lecciones completadas</p>
            </div>
          </div>

          {/* Module / Lesson list */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

            {/* M1 — Canvas SPEC (always first, fixed) */}
            <button
              onClick={() => { setCanvasView('list'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group text-left ${
                showCanvas
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'
              }`}
            >
              <span className={`text-[10px] font-black w-5 shrink-0 transition-colors ${showCanvas ? 'text-cyan-400' : 'text-lms-text-muted'}`}>M1</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  background: `linear-gradient(135deg, #0891b2${showCanvas ? '3a' : '1c'}, #0891b208)`,
                  boxShadow: showCanvas ? '0 2px 8px #0891b230, inset 0 1px 0 #0891b230' : 'none',
                  border: `1px solid #0891b2${showCanvas ? '30' : '18'}`,
                }}
              >
                <Workflow size={15} className={showCanvas ? 'text-cyan-500' : 'text-lms-text-muted group-hover:text-cyan-500 transition-colors'} />
              </div>
              <span className="flex-1 truncate">Canvas de Procesos SPEC</span>
              {showCanvas && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
            </button>

            {course.modules.map((mod, mIdx) => {
              const isModOpen = openModules.has(mod.id);
              return (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group text-left ${
                      isModOpen && !showCanvas
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'
                    }`}
                  >
                    <span className={`text-[10px] font-black w-6 shrink-0 transition-colors ${isModOpen && !showCanvas ? 'text-cyan-400' : 'text-lms-text-muted'}`}>
                      M{mIdx + 2}
                    </span>
                    <span className="flex-1 truncate">
                      {mod.title}
                    </span>
                    {isModOpen && !showCanvas && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                  </button>

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
                        <div className="pl-9 pr-2 pb-2 pt-0.5 space-y-0.5">
                          {mod.lessons.map((lesson, lIdx) => {
                            const isActive = activeLesson?.id === lesson.id && !showCanvas;
                            const isDone = completed.has(lesson.id);
                            return (
                              <motion.button
                                key={lesson.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: lIdx * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                                onClick={() => { setActiveLesson(lesson); setCanvasView(null); setSidebarOpen(false); }}
                                whileHover={{ x: 2 }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                                  isActive
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-sm'
                                    : 'hover:bg-lms-hover'
                                }`}
                              >
                                <div className="shrink-0 w-4">
                                  <AnimatePresence mode="wait" initial={false}>
                                    {isDone ? (
                                      <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <CheckCircle size={14} className="text-emerald-400" />
                                      </motion.div>
                                    ) : isActive ? (
                                      <motion.div key="active" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                                          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Circle size={14} className="text-lms-text-muted/40" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[11px] font-semibold leading-snug transition-colors ${
                                    isActive ? 'text-cyan-500' : isDone ? 'text-lms-text-muted' : 'text-lms-text-primary'
                                  }`}>
                                    {lIdx + 1}. {lesson.title}
                                  </p>
                                  {lesson.duration_min > 0 && (
                                    <p className="text-[9px] text-lms-text-muted mt-0.5">{lesson.duration_min} min</p>
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
        {canvasView === 'list' ? (
          <CanvasListView
            courseId={courseId}
            onOpen={id => setCanvasView({ canvasId: id })}
            onBack={() => setCanvasView(null)}
          />
        ) : canvasView ? (
          <ProcessCanvas canvasId={canvasView.canvasId} onBack={() => setCanvasView('list')} />
        ) : viewingFile ? (
          <FileNotesPage file={viewingFile} onBack={() => setViewingFile(null)} />
        ) : (
        <>
        {/* Lesson topbar */}
        <div className="flex items-center gap-4 px-4 lg:px-6 h-16 bg-lms-surface border-b border-lms-border shrink-0">
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
                  structuredContent.description && (
                    <AreaCards description={structuredContent.description} />
                  )
                ) : (
                  <div className="prose prose-slate prose-sm md:prose-base max-w-none bg-white border border-lms-border rounded-2xl p-6 md:p-8 shadow-sm text-slate-700">
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                )
              )}

              {/* Contenido de la sesión: temas, alcances, material y feedback en un solo acordeón tipo Platzi */}
              {(() => {
                const rows: { key: string; title: string; count: string; icon: React.ElementType; color: string; content: ReactNode }[] = [];

                if (structuredContent && structuredContent.temas.length > 0) {
                  rows.push({
                    key: 'temas',
                    title: 'Temas a cubrir',
                    count: `${structuredContent.temas.length} tema${structuredContent.temas.length !== 1 ? 's' : ''}`,
                    icon: Target,
                    color: '#06b6d4',
                    content: <TopicPath temas={structuredContent.temas} color="#06b6d4" />,
                  });
                }

                if (structuredContent && structuredContent.alcances.length > 0) {
                  rows.push({
                    key: 'alcances',
                    title: 'Alcances',
                    count: `${structuredContent.alcances.length} alcance${structuredContent.alcances.length !== 1 ? 's' : ''}`,
                    icon: Flag,
                    color: '#10b981',
                    content: (
                      <ul className="space-y-3 m-0 p-0 list-none">
                        {structuredContent.alcances.map((alcance, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-lms-text-primary leading-relaxed">
                            <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                            <span>{alcance}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  });
                }

                if (activeLesson.pdf_url) {
                  const urls = activeLesson.pdf_url.split(',').map(u => u.trim()).filter(Boolean);
                  rows.push({
                    key: 'material',
                    title: 'Material Descargable',
                    count: `${urls.length} archivo${urls.length !== 1 ? 's' : ''}`,
                    icon: Package,
                    color: '#6366f1',
                    content: (
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
                                <div className="w-10 h-10 shrink-0 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                  <meta.icon size={20} className="text-cyan-400" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <h4 className="text-sm font-bold text-lms-text-primary truncate" title={decodedName}>
                                    {displayName}
                                  </h4>
                                  <p className="text-xs text-lms-text-muted truncate mt-0.5">
                                    Archivo descargable
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                  onClick={() => setViewingFile({ url, viewerUrl, name: displayName })}
                                  className="inline-flex items-center justify-center gap-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors w-full"
                                >
                                  <Eye size={16} /> Ver Archivo
                                </button>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 bg-lms-hover border border-lms-border hover:border-lms-text-muted/40 text-lms-text-muted hover:text-lms-text-primary px-4 py-2.5 rounded-lg font-bold text-xs transition-colors w-full"
                                >
                                  <DownloadCloud size={16} /> Descargar
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ),
                  });
                }

                if (structuredContent && structuredContent.temas.length > 0) {
                  rows.push({
                    key: 'kanban',
                    title: 'Feedback de aprendizaje',
                    count: `${structuredContent.temas.length} tema${structuredContent.temas.length !== 1 ? 's' : ''}`,
                    icon: MessageSquare,
                    color: '#8b5cf6',
                    content: <TopicKanban key={activeLesson.id} lessonId={activeLesson.id} temas={structuredContent.temas} />,
                  });
                }

                if (structuredContent && structuredContent.quiz.length > 0) {
                  rows.push({
                    key: 'quiz',
                    title: 'Evaluación',
                    count: `${structuredContent.quiz.length} preguntas`,
                    icon: Trophy,
                    color: '#f59e0b',
                    content: <QuizGame key={activeLesson.id} lessonId={activeLesson.id} questions={structuredContent.quiz} />,
                  });
                }

                if (rows.length === 0) return null;

                return (
                  <div className="space-y-4">
                    {rows.map((row, i) => (
                      <AccordionRow
                        key={`${activeLesson.id}-${row.key}`}
                        index={i + 1}
                        title={row.title}
                        count={row.count}
                        icon={row.icon}
                        color={row.color}
                      >
                        {row.content}
                      </AccordionRow>
                    ))}
                  </div>
                );
              })()}

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
                        disabled={!next && completed.has(activeLesson.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/20"
                      >
                        {next ? 'Siguiente lección' : completed.has(activeLesson.id) ? '¡Curso completado!' : 'Marcar como completada'} <ChevronRight size={16} />
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

const AREA_STYLES: Record<string, { icon: React.ElementType; color: string }> = {
  'Finanzas': { icon: DollarSign, color: '#10b981' },
  'Recursos Humanos': { icon: Users, color: '#8b5cf6' },
  'Administrativa': { icon: ClipboardList, color: '#0ea5e9' },
  'Compras': { icon: ShoppingCart, color: '#f59e0b' },
};

/** Splits the "Aplicación por área" paragraph into a grid of colorful area cards instead of one dense block of text. */
/** Kahoot/trivia-style quiz: one question at a time, streak counter, and a celebratory results screen. */
type TileStatus = 'pending' | 'correct' | 'wrong';
const QUIZ_LIVES = 3;

/** Board-game style quiz: 5 level tiles on a path, a bear token that advances, and 3 lives — miss too many and it's game over. */
function QuizGame({ lessonId, questions }: { lessonId: string; questions: QuizQuestion[] }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [lives, setLives] = useState(QUIZ_LIVES);
  const [tileStatus, setTileStatus] = useState<TileStatus[]>(() => questions.map(() => 'pending'));
  const [gameOver, setGameOver] = useState(false);
  const [finished, setFinished] = useState(false);
  const savedRef = useRef(false);

  const q = questions[step];

  const finalize = (finalTiles: TileStatus[]) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const finalScore = finalTiles.filter(s => s === 'correct').length;
    saveQuizResult(lessonId, finalScore, questions.length).catch(err => {
      console.error('No se pudo guardar el resultado del quiz:', err);
      toast.error('No se pudo guardar tu calificación');
    });
  };

  const handleSelect = (idx: number) => {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    const isCorrect = idx === q.correct;
    const nextTiles = tileStatus.map((s, i) => (i === step ? (isCorrect ? 'correct' : 'wrong') as TileStatus : s));
    setTileStatus(nextTiles);
    const nextLives = isCorrect ? lives : lives - 1;
    if (!isCorrect) setLives(nextLives);

    setTimeout(() => {
      if (!isCorrect && nextLives <= 0) {
        setGameOver(true);
        finalize(nextTiles);
        return;
      }
      if (step < questions.length - 1) {
        setStep(s => s + 1);
        setSelected(null);
        setLocked(false);
      } else {
        setFinished(true);
        finalize(nextTiles);
      }
    }, 1100);
  };

  const restart = () => {
    savedRef.current = false;
    setStep(0); setSelected(null); setLocked(false);
    setLives(QUIZ_LIVES);
    setTileStatus(questions.map(() => 'pending'));
    setGameOver(false); setFinished(false);
  };

  if (questions.length === 0) return null;

  if (gameOver) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center text-white shadow-xl">
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220 }} className="text-5xl mb-2">💀</motion.div>
        <p className="text-2xl font-black mb-1">Te quedaste sin vidas</p>
        <p className="text-sm opacity-80 mb-5">Llegaste hasta la pregunta {step + 1} de {questions.length}</p>
        <button onClick={restart}
          className="px-6 py-2.5 rounded-xl bg-white text-slate-800 text-sm font-black hover:bg-slate-100 transition-colors shadow-lg">
          Intentar de nuevo
        </button>
      </motion.div>
    );
  }

  if (finished) {
    const emoji = lives === QUIZ_LIVES ? '🏆' : lives >= 2 ? '🎉' : '😅';
    const msg = lives === QUIZ_LIVES ? '¡Perfecto, sin errores!' : lives >= 2 ? '¡Completaste el nivel!' : '¡Justo a tiempo!';
    const score = tileStatus.filter(s => s === 'correct').length;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 p-8 text-center text-white shadow-xl">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, delay: 0.1 }} className="text-5xl mb-2">
          {emoji}
        </motion.div>
        <p className="text-2xl font-black mb-1">{msg}</p>
        <p className="text-sm opacity-90 mb-1">Terminaste con {lives} de {QUIZ_LIVES} vidas</p>
        <p className="text-xs opacity-75 mb-5">{score} de {questions.length} respuestas correctas</p>
        <button onClick={restart}
          className="px-6 py-2.5 rounded-xl bg-white text-violet-700 text-sm font-black hover:bg-violet-50 transition-colors shadow-lg">
          Jugar de nuevo
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-violet-50 via-white to-sky-50 border border-violet-100 p-6 shadow-lg">
      {/* Level label + lives */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Nivel {step + 1} de {questions.length}</p>
        <div className="flex gap-1">
          {Array.from({ length: QUIZ_LIVES }).map((_, i) => (
            <motion.span key={i}
              animate={i >= lives ? { scale: [1, 1.3, 0.9], opacity: [1, 1, 0.35] } : { scale: 1, opacity: 1 }}
              className="text-base">
              {i < lives ? '❤️' : '🤍'}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Board path */}
      <div className="relative flex items-center justify-between mb-6 px-1">
        <div className="absolute left-3 right-3 top-3.5 h-0.5 bg-slate-200" />
        {questions.map((_, i) => {
          const status = tileStatus[i];
          const isCurrent = i === step;
          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1">
              <div className="h-4 flex items-end">
                {isCurrent && (
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-sm">
                    🐻
                  </motion.span>
                )}
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-colors duration-300 ${
                status === 'correct' ? 'bg-emerald-500 border-emerald-300 text-white'
                  : status === 'wrong' ? 'bg-rose-500 border-rose-300 text-white'
                  : isCurrent ? 'bg-violet-500 border-violet-300 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {status === 'correct' ? '✓' : status === 'wrong' ? '✗' : i + 1}
              </div>
            </div>
          );
        })}
        <span className="relative z-10 text-lg">🏁</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          className="text-base font-bold leading-snug mb-5 text-slate-800">
          {q.question}
        </motion.p>
      </AnimatePresence>

      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectOpt = i === q.correct;
          let style = 'bg-white border-slate-200 text-slate-700 hover:border-violet-200 hover:bg-violet-50/50';
          if (locked && isCorrectOpt) style = 'bg-emerald-50 border-emerald-400 text-emerald-700';
          else if (locked && isSelected && !isCorrectOpt) style = 'bg-rose-50 border-rose-400 text-rose-700';
          return (
            <motion.button key={`${step}-${i}`}
              onClick={() => handleSelect(i)}
              whileHover={!locked ? { scale: 1.01 } : {}}
              whileTap={!locked ? { scale: 0.98 } : {}}
              animate={locked && isSelected && !isCorrectOpt ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-colors flex items-center gap-3 shadow-sm ${style}`}
            >
              <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {locked && isCorrectOpt && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
              {locked && isSelected && !isCorrectOpt && <X size={16} className="text-rose-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function AreaCards({ description }: { description: string }) {
  const items = description
    .split('\n')
    .map(line => {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      return m ? { label: m[1].trim(), text: m[2].trim() } : null;
    })
    .filter((v): v is { label: string; text: string } => v !== null && v.text.length > 0);

  if (items.length === 0) {
    return (
      <div className="bg-lms-surface border border-lms-border rounded-2xl p-6 md:p-8 shadow-sm">
        <p className="text-xs md:text-sm text-lms-text-primary leading-relaxed">{description}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => {
        const style = AREA_STYLES[item.label] ?? { icon: Sparkles, color: '#64748b' };
        const Icon = style.icon;
        return (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 320, damping: 26 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border p-4 shadow-sm transition-shadow"
            style={{ borderColor: `${style.color}30`, background: `linear-gradient(135deg, ${style.color}0d, transparent)` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${style.color}40, ${style.color}15)`, boxShadow: `0 2px 6px ${style.color}30` }}>
                <Icon size={15} style={{ color: style.color }} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: style.color }}>{item.label}</p>
            </div>
            <p className="text-xs sm:text-sm text-lms-text-primary leading-relaxed">{item.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Duolingo-style zigzag progress path: numbered nodes on a dashed spine, alternating sides. */
function TopicPath({ temas, color }: { temas: string[]; color: string }) {
  return (
    <div className="relative py-2">
      <div className="absolute left-1/2 top-6 bottom-6 -translate-x-1/2 border-l-2 border-dashed pointer-events-none"
        style={{ borderColor: `${color}35` }} />
      <div className="space-y-5">
        {temas.map((tema, i) => {
          const isLeft = i % 2 === 0;
          const card = (
            <div className={`max-w-xs rounded-2xl border bg-white px-4 py-3 shadow-sm ${isLeft ? 'text-right' : 'text-left'}`}
              style={{ borderColor: `${color}25` }}>
              <p className="text-xs sm:text-sm text-lms-text-primary leading-relaxed">{tema}</p>
            </div>
          );
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 26 }}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
            >
              <div className={isLeft ? 'flex justify-end' : ''}>{isLeft && card}</div>
              <motion.div whileHover={{ scale: 1.15 }}
                className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 14px ${color}50` }}>
                {i + 1}
              </motion.div>
              <div className={!isLeft ? 'flex justify-start' : ''}>{!isLeft && card}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface AccordionRowProps {
  index: number;
  title: string;
  count: string;
  icon: React.ElementType;
  color: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** "Level card" style accordion row: gradient icon badge with a level-number chip, glow on open. */
function AccordionRow({ index, title, count, icon: Icon, color, defaultOpen = false, children }: AccordionRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: open ? `${color}55` : `${color}20`,
        boxShadow: open ? `0 10px 28px ${color}18` : `0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 transition-colors text-left group"
        style={{ background: `linear-gradient(135deg, ${color}12, transparent 70%)` }}
      >
        <motion.div whileHover={{ scale: 1.1, rotate: -4 }}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 14px ${color}45` }}
        >
          <Icon size={17} />
          <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center text-[9px] font-black"
            style={{ borderColor: color, color }}>
            {index}
          </span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>Nivel {index}</p>
          <span className="text-sm font-black text-lms-text-primary truncate block">{title}</span>
        </div>
        <span className="text-[10px] font-bold text-lms-text-muted shrink-0">{count}</span>
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
            <div className="px-5 pb-5 pt-0.5">{children}</div>
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
      <div className="flex items-center gap-4 px-4 lg:px-6 h-16 bg-lms-surface border-b border-lms-border shrink-0">
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
