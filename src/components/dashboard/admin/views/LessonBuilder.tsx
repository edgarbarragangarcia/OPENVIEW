import { useState } from 'react';
import { File, Video, Save, Trash2, UploadCloud } from 'lucide-react';
import { Lesson, createLesson, updateLesson, deleteLesson, uploadFile, getFileUrl } from '../../../../lib/courses';

interface LessonBuilderProps {
  moduleId: string;
  lesson?: Lesson;
  onSaved: () => void;
  onCancel: () => void;
}

export function LessonBuilder({ moduleId, lesson, onSaved, onCancel }: LessonBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Lesson>>(
    lesson || {
      title: '',
      content: '',
      video_url: '', // Here we will save either the YouTube URL or the Supabase Storage URL (PDF/Video)
      duration_min: 5,
      is_free: false,
    }
  );
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const path = `lessons/${fileName}`;
      
      await uploadFile('lms_assets', path, file);
      const url = getFileUrl('lms_assets', path);
      
      setFormData(prev => ({ ...prev, video_url: url }));
    } catch (err) {
      console.error(err);
      alert('Error al subir el archivo. Revisa los permisos del bucket.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) return alert('El título es requerido');
    setLoading(true);
    try {
      if (lesson?.id) {
        await updateLesson(lesson.id, formData);
      } else {
        await createLesson({ ...formData, module_id: moduleId });
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Error guardando la lección');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson?.id) return;
    if (!confirm('¿Eliminar esta lección?')) return;
    setLoading(true);
    try {
      await deleteLesson(lesson.id);
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Lección</label>
        <input 
          name="title" value={formData.title} onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20"
          placeholder="Ej. Introducción a IA"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Archivo adjunto o URL (Video/PDF)</label>
        <div className="flex gap-2">
          <input 
            name="video_url" value={formData.video_url} onChange={handleChange}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20"
            placeholder="URL externa o sube un archivo 👉"
          />
          <div className="relative">
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              accept="video/mp4,application/pdf"
              title="Subir PDF o Video"
            />
            <button type="button" className="h-full px-3 bg-sky-50 text-sky-600 rounded-lg border border-sky-100 flex items-center gap-2 hover:bg-sky-100 transition-colors">
              <UploadCloud size={16} />
              {uploadingFile ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Duración (minutos)</label>
          <input 
            name="duration_min" type="number" value={formData.duration_min} onChange={handleChange}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input 
              type="checkbox" name="is_free" checked={formData.is_free} onChange={handleChange}
              className="rounded text-sky-500 focus:ring-sky-500"
            />
            Lección de muestra (Gratis)
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={handleDelete}
          disabled={!lesson?.id || loading}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-0"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading || uploadingFile} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50">
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
