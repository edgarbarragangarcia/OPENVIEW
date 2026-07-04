import { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { getCourseById } from '../../../../lib/courses';
import { markLessonComplete, markLessonIncomplete, getMyProgress } from '../../../../lib/enrollments';
import { useAuth } from '../../../../contexts/AuthContext';

interface LessonViewerProps {
  courseId: string;
  onBack: () => void;
}

export function LessonViewer({ courseId, onBack }: LessonViewerProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    const [courseData, progressData] = await Promise.all([
      getCourseById(courseId),
      getMyProgress(user.id, courseId)
    ]);
    
    setCourse(courseData);
    setProgress(progressData);
    setLoading(false);

    // Seleccionar la primera lección no completada si no hay activa
    if (courseData?.modules?.length > 0 && !activeLesson) {
      const allLessons = courseData.modules.flatMap((m: any) => m.lessons || []).sort((a: any, b: any) => a.position - b.position);
      const firstUncompleted = allLessons.find((l: any) => !progressData.find((p: any) => p.lesson_id === l.id && p.completed));
      setActiveLesson(firstUncompleted || allLessons[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, user]);

  const toggleComplete = async (lessonId: string, isCompleted: boolean) => {
    if (!user) return;
    if (isCompleted) {
      await markLessonIncomplete(user.id, lessonId);
    } else {
      await markLessonComplete(user.id, lessonId);
    }
    await loadData();
  };

  if (loading) return <div className="p-8 text-slate-500">Cargando lección...</div>;
  if (!course) return <div className="p-8 text-red-500">Curso no encontrado</div>;

  const isPDF = activeLesson?.video_url?.toLowerCase().endsWith('.pdf');
  const isVideo = activeLesson?.video_url && !isPDF;
  const isCompleted = progress.find(p => p.lesson_id === activeLesson?.id)?.completed;

  return (
    <div className="flex h-full flex-col lg:flex-row bg-white">
      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 bg-white z-10">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-900 truncate">{course.title}</h2>
        </div>

        <div className="flex-1 p-4 lg:p-8">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Reproductor / Visor */}
              <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex items-center justify-center">
                {isPDF ? (
                  <iframe 
                    src={`${activeLesson.video_url}#toolbar=0`} 
                    className="w-full h-full border-0 bg-white"
                    title="PDF Viewer"
                  />
                ) : isVideo ? (
                  <video 
                    src={activeLesson.video_url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>No hay contenido multimedia adjunto.</p>
                  </div>
                )}
              </div>

              {/* Título y Acciones */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2">{activeLesson.title}</h1>
                  {activeLesson.content && (
                    <p className="text-slate-600 leading-relaxed">{activeLesson.content}</p>
                  )}
                </div>

                <button 
                  onClick={() => toggleComplete(activeLesson.id, isCompleted)}
                  className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-slate-900 text-white hover:bg-sky-600'
                  }`}
                >
                  <CheckCircle size={18} />
                  {isCompleted ? 'Completado' : 'Marcar Completado'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Selecciona una lección del menú.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar de Módulos (Derecha) */}
      <div className="w-full lg:w-80 border-l border-slate-100 bg-slate-50 h-full overflow-y-auto shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h3 className="font-bold text-slate-900">Contenido del Curso</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {course.modules?.sort((a: any, b: any) => a.position - b.position).map((mod: any) => (
            <div key={mod.id} className="space-y-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2 mb-2">{mod.title}</h4>
              {mod.lessons?.sort((a: any, b: any) => a.position - b.position).map((lesson: any) => {
                const isActive = activeLesson?.id === lesson.id;
                const isLessonCompleted = progress.find(p => p.lesson_id === lesson.id)?.completed;
                const lessonIsPDF = lesson.video_url?.toLowerCase().endsWith('.pdf');

                return (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-white shadow-sm border border-sky-200' 
                        : 'hover:bg-slate-200/50 border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isLessonCompleted ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : lessonIsPDF ? (
                        <FileText size={16} className={isActive ? 'text-sky-500' : 'text-slate-400'} />
                      ) : (
                        <PlayCircle size={16} className={isActive ? 'text-sky-500' : 'text-slate-400'} />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium leading-tight ${isActive ? 'text-sky-700' : 'text-slate-700'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{lesson.duration_min} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
