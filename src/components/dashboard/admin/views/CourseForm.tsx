import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Course, getCourseById, createCourse, updateCourse, getCategories, Category } from '../../../../lib/courses';
import { useAuth } from '../../../../contexts/AuthContext';

interface CourseFormProps {
  courseId?: string;
  onBack: () => void;
}

export function CourseForm({ courseId, onBack }: CourseFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    getCategories().then(setCategories);
    if (courseId) {
      getCourseById(courseId).then(data => {
        if (data) setFormData(data);
      });
    }
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
      } else {
        await createCourse({ ...formData, created_by: user.id });
      }
      onBack();
    } catch (e) {
      console.error(e);
      alert('Error guardando curso');
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
          className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar Curso'}
        </button>
      </div>

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

      {courseId && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-slate-500 mb-4">El contenido del curso (módulos y lecciones) se administrará aquí próximamente.</p>
          <button disabled className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
            <Plus size={18} /> Añadir Módulo
          </button>
        </div>
      )}
    </div>
  );
}
