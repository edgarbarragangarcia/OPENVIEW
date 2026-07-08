import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, BookOpen } from 'lucide-react';
import { Course, getCourseById, createCourse, updateCourse, getCategories, Category, createModule, updateLesson } from '../../../../lib/courses';
import { useAuth } from '../../../../contexts/AuthContext';
import { ModuleBuilder } from './ModuleBuilder';
import { PromptModal } from '../../shared/Modals';
import toast from 'react-hot-toast';

interface CourseFormProps {
  courseId?: string;
  onBack: () => void;
}

export function CourseForm({ courseId, onBack }: CourseFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'content'>('details');
  const [showModulePrompt, setShowModulePrompt] = useState(false);
  const [draggedLesson, setDraggedLesson] = useState<{ lessonId: string; fromModuleId: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    long_desc: '',
    cover_url: '',
    price: 0,
    level: 'beginner',
    duration_hrs: 1,
    published: false,
    category_id: undefined,
  });

  const loadCourse = async () => {
    if (courseId) {
      const data = await getCourseById(courseId);
      if (data) {
        setCourseData(data);
        setFormData({
          title: data.title,
          description: data.description,
          long_desc: data.long_desc,
          cover_url: data.cover_url,
          price: data.price,
          level: data.level,
          duration_hrs: data.duration_hrs,
          published: data.published,
          category_id: data.category_id,
        });
      }
    }
  };

  useEffect(() => {
    getCategories().then(setCategories);
    loadCourse();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as any).checked : value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (courseId) {
        await updateCourse(courseId, formData);
        toast.success('Curso actualizado', { style: { background: '#1c2030', color: '#fff' } });
      } else {
        const newCourse = await createCourse({ ...formData, created_by: user.id });
        toast.success('Curso creado, ahora añade contenido', { style: { background: '#1c2030', color: '#fff' } });
        onBack();
      }
    } catch (e) {
      console.error(e);
      toast.error('Error guardando curso', { style: { background: '#ef4444', color: '#fff' } });
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (title: string) => {
    if (!courseId) return;
    setLoading(true);
    try {
      await createModule({ course_id: courseId, title, position: (courseData?.modules?.length || 0) });
      await loadCourse();
      toast.success('Módulo creado', { style: { background: '#1c2030', color: '#fff' } });
    } catch (err) {
      toast.error('Error creando módulo', { style: { background: '#ef4444', color: '#fff' } });
    } finally {
      setLoading(false);
    }
  };

  const handleLessonDrop = async (lessonId: string, fromModuleId: string, toModuleId: string) => {
    if (fromModuleId === toModuleId) return;
    try {
      const toMod = courseData?.modules?.find((m: any) => m.id === toModuleId);
      const newPosition = toMod?.lessons?.length ?? 0;
      await updateLesson(lessonId, { module_id: toModuleId, position: newPosition });
      await loadCourse();
      toast.success('Lección movida al bloque', { style: { background: '#1c2030', color: '#fff' } });
    } catch (err) {
      toast.error('Error moviendo lección', { style: { background: '#ef4444', color: '#fff' } });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      
      {/* Prompt Modal */}
      <PromptModal
        isOpen={showModulePrompt}
        title="Nuevo Módulo"
        placeholder="Ej: Módulo 1: Introducción"
        confirmText="Crear Módulo"
        onConfirm={handleAddModule}
        onCancel={() => setShowModulePrompt(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 text-lms-text-muted hover:text-lms-text-primary bg-lms-surface border border-lms-border rounded-xl transition-colors hover:bg-lms-hover"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-lms-text-primary">
              {courseId ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h1>
            {courseData && <p className="text-sm text-lms-text-muted mt-0.5">{courseData.title}</p>}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20"
        >
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar Detalles'}
        </button>
      </div>

      {courseId && (
        <div className="flex border-b border-lms-border mb-6">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-violet-500 text-violet-400' : 'border-transparent text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover/50 rounded-t-xl'}`}
          >
            Detalles del Curso
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'content' ? 'border-violet-500 text-violet-400' : 'border-transparent text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover/50 rounded-t-xl'}`}
          >
            Contenido (Módulos y Lecciones)
          </button>
        </div>
      )}

      {activeTab === 'details' ? (
        <div className="bg-lms-surface border border-lms-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Título del Curso</label>
              <input 
                name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all font-medium text-lms-text-primary placeholder-lms-text-muted"
                placeholder="Ej. IA para Líderes"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Descripción corta</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={2}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all resize-none text-lms-text-primary placeholder-lms-text-muted"
                placeholder="Un resumen atractivo de qué trata el curso..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Categoría</label>
              <select 
                name="category_id" value={formData.category_id || ''} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all text-lms-text-primary"
              >
                <option value="">-- Selecciona --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Nivel</label>
              <select 
                name="level" value={formData.level} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all text-lms-text-primary"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Precio (USD)</label>
              <input 
                name="price" type="number" min="0" value={formData.price} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all text-lms-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">Duración (Horas)</label>
              <input 
                name="duration_hrs" type="number" min="0.5" step="0.5" value={formData.duration_hrs} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all text-lms-text-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-lms-text-muted mb-2">URL Imagen Portada</label>
              <input 
                name="cover_url" value={formData.cover_url} onChange={handleChange}
                className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl focus:outline-none focus:border-violet-500 transition-all text-lms-text-primary placeholder-lms-text-muted"
                placeholder="https://..."
              />
              {formData.cover_url && (
                <div className="mt-4 h-44 w-full sm:w-72 rounded-xl overflow-hidden border border-lms-border bg-lms-hover relative group">
                  <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-lms-surface p-4 rounded-2xl border border-lms-border">
            <h3 className="font-bold text-lms-text-primary ml-2">Módulos del Curso</h3>
            <button 
              onClick={() => setShowModulePrompt(true)}
              className="inline-flex items-center gap-2 bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 px-5 py-2 rounded-xl font-bold text-sm transition-colors border border-violet-500/20"
            >
              <Plus size={18} /> Añadir Módulo
            </button>
          </div>

          <div className="space-y-4">
            {!courseData?.modules?.length ? (
              <div className="bg-lms-surface border border-lms-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <BookOpen size={48} className="text-lms-text-muted/30 mb-4" />
                <h3 className="text-lg font-bold text-lms-text-primary mb-1">Empieza a construir tu curso</h3>
                <p className="text-sm text-lms-text-muted max-w-sm">Los módulos organizan tus lecciones por secciones. Crea el primer módulo para añadir contenido.</p>
                <button 
                  onClick={() => setShowModulePrompt(true)}
                  className="mt-6 inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20"
                >
                  <Plus size={18} /> Crear Primer Módulo
                </button>
              </div>
            ) : (
              courseData.modules
                .sort((a: any, b: any) => a.position - b.position)
                .map((mod: any) => (
                  <ModuleBuilder
                    key={mod.id}
                    courseId={courseId!}
                    module={mod}
                    onRefresh={loadCourse}
                    draggedLesson={draggedLesson}
                    onLessonDragStart={(lessonId, fromModuleId) =>
                      setDraggedLesson({ lessonId, fromModuleId })
                    }
                    onLessonDragEnd={() => setDraggedLesson(null)}
                    onLessonDrop={handleLessonDrop}
                  />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
