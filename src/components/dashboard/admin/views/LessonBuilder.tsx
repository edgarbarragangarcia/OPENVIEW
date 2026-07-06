import { useState } from 'react';
import { Save, X, Trash2, Upload, Loader2 } from 'lucide-react';
import { Lesson, createLesson, updateLesson, deleteLesson, uploadFile, getFileUrl } from '../../../../lib/courses';
import { ConfirmModal } from '../../shared/Modals';

interface LessonBuilderProps {
  moduleId: string;
  lesson?: Lesson;
  onSaved: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}

export function LessonBuilder({ moduleId, lesson, onSaved, onCancel, onRefresh }: LessonBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Lesson>>(lesson || {
    title: '',
    content: '',
    video_url: '',
    pdf_url: '',
    duration_min: 5,
    is_free: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const path = `lessons/${moduleId}/${fileName}`;
      
      await uploadFile('pdfs', path, file);
      const url = getFileUrl('pdfs', path);
      
      setFormData(prev => ({ ...prev, pdf_url: url }));
    } catch (err) {
      console.error('Error uploading PDF:', err);
      alert('Error al subir el PDF. Asegúrate de haber configurado el bucket "pdfs" en Supabase.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) return;
    setLoading(true);
    try {
      if (lesson) {
        await updateLesson(lesson.id, formData);
      } else {
        await createLesson({ ...formData, module_id: moduleId } as Omit<Lesson, 'id'>);
      }
      onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson) return;
    setLoading(true);
    try {
      await deleteLesson(lesson.id);
      onRefresh();
      onCancel();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-lms-surface border border-cyan-500/30 rounded-xl p-5 shadow-lg shadow-cyan-500/5 relative animate-in fade-in zoom-in-95 duration-200">
      {lesson && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Lección"
          message={`¿Estás seguro de que deseas eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, Eliminar Lección"
          isDestructive={true}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h4 className="font-black text-lms-text-primary">{lesson ? 'Editar Lección' : 'Nueva Lección'}</h4>
        <div className="flex gap-2">
          {lesson && (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="p-1.5 text-lms-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onCancel} className="p-1.5 text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">Título</label>
          <input 
            name="title" value={formData.title} onChange={handleChange} autoFocus
            className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500 transition-colors placeholder-lms-text-muted"
            placeholder="Ej. Introducción al tema"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">URL Video (Youtube/Vimeo)</label>
            <input 
              name="video_url" value={formData.video_url || ''} onChange={handleChange}
              className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500 transition-colors placeholder-lms-text-muted"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">Archivo PDF</label>
            <div className="flex gap-2">
              <input 
                name="pdf_url" value={formData.pdf_url || ''} onChange={handleChange} placeholder="URL o sube un archivo ➔"
                className="flex-1 px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500 transition-colors placeholder-lms-text-muted"
              />
              <label className="flex-shrink-0 cursor-pointer flex items-center justify-center bg-lms-bg border border-lms-border hover:border-cyan-500 rounded-lg px-3 transition-colors" title="Subir PDF">
                {uploadingPdf ? <Loader2 size={16} className="animate-spin text-cyan-500" /> : <Upload size={16} className="text-lms-text-muted" />}
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">Contenido (HTML / Texto)</label>
          <textarea 
            name="content" value={formData.content || ''} onChange={handleChange} rows={4}
            className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder-lms-text-muted"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-lms-text-muted">Duración (min)</label>
              <input 
                name="duration_min" type="number" min="0" value={formData.duration_min} onChange={handleChange}
                className="w-16 px-2 py-1 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                name="is_free" type="checkbox" checked={formData.is_free} onChange={handleChange}
                className="rounded border-lms-border text-cyan-500 focus:ring-cyan-500 bg-lms-bg"
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-lms-text-muted group-hover:text-lms-text-primary transition-colors">Vista Previa Gratis</span>
            </label>
          </div>

          <button 
            onClick={handleSave} disabled={loading || !formData.title}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            <Save size={16} /> Guardar Lección
          </button>
        </div>
      </div>
    </div>
  );
}
