import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Course, getCourseById, createCourse, updateCourse, getCategories, Category, createModule } from '../../../../lib/courses';
import { useAuth } from '../../../../contexts/AuthContext';
import { ModuleBuilder } from './ModuleBuilder';
import toast from 'react-hot-toast';

interface CourseFormProps {
  courseId?: string;
  onBack: () => void;
}

export function CourseForm({ courseId, onBack }: CourseFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<any>(null); // To hold full course with modules
  const [activeTab, setActiveTab] = useState<'details' | 'content'>('details');

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
        toast.success('Curso actualizado');
      } else {
        const newCourse = await createCourse({ ...formData, created_by: user.id });
        toast.success('Curso creado, ahora puedes añadir contenido.');
        onBack(); // Simplest is to go back to list
      }
    } catch (e) {
      console.error(e);
      toast.error('Error guardando curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!courseId) return;
    const title = prompt('Nombre del nuevo módulo:');
    if (!title) return;
    
    setLoading(true);
    try {
      await createModule({ course_id: courseId, title, position: (courseData?.modules?.length || 0) });
      await loadCourse();
    } catch (err) {
      toast.error('Error creando módulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-900">
            {courseId ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar Detalles'}
        </button>
      </div>

      {courseId && (
        <div className="flex border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Detalles del Curso
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'content' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Contenido (Módulos y Lecciones)
          </button>
        </div>
      )}

      {activeTab === 'details' ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Título del Curso</label>
              <input 
                name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                placeholder="Ej. IA para Líderes"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Descripción corta</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
              <select 
                name="category_id" value={formData.category_id || ''} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="">Selecciona...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nivel</label>
              <select 
                name="level" value={formData.level} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Precio (USD)</label>
              <input 
                name="price" type="number" min="0" value={formData.price} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duración (Horas)</label>
              <input 
                name="duration_hrs" type="number" min="0.5" step="0.5" value={formData.duration_hrs} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">URL Imagen Portada</label>
              <input 
                name="cover_url" value={formData.cover_url} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                placeholder="https://..."
              />
              {formData.cover_url && (
                <div className="mt-4 h-40 w-full sm:w-64 rounded-xl overflow-hidden border border-slate-200">
                  <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={handleAddModule}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={18} /> Añadir Módulo
            </button>
          </div>

          <div className="space-y-4">
            {!courseData?.modules?.length ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-slate-500">Este curso no tiene módulos aún.</p>
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
                  />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

