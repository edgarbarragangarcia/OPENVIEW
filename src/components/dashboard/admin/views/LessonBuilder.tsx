import { useState, useEffect } from 'react';
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

interface StructuredContent {
  type: 'structured';
  description: string;
  temas: string[];
  alcances: string[];
}

export function LessonBuilder({ moduleId, lesson, onSaved, onCancel, onRefresh }: LessonBuilderProps) {
  const [formData, setFormData] = useState<Partial<Lesson>>(lesson || {
    title: '', content: '', video_url: '', pdf_url: '', duration_min: 5, is_free: false, position: 0
  });

  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Structured Content state
  const initialParsed = (() => {
    try {
      if (formData.content?.trim().startsWith('{')) {
        const p = JSON.parse(formData.content);
        if (p.type === 'structured') return p;
      }
    } catch (e) {}
    return null;
  })();

  const [useStructured, setUseStructured] = useState(!!initialParsed || !formData.content);
  const [structuredData, setStructuredData] = useState<StructuredContent>(
    initialParsed || { type: 'structured', description: formData.content || '', temas: [], alcances: [] }
  );

  useEffect(() => {
    if (useStructured) {
      setFormData(prev => ({ ...prev, content: JSON.stringify(structuredData) }));
    }
  }, [structuredData, useStructured]);

  const addTema = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        setStructuredData(prev => ({ ...prev, temas: [...prev.temas, val] }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeTema = (idx: number) => {
    setStructuredData(prev => ({ ...prev, temas: prev.temas.filter((_, i) => i !== idx) }));
  };

  const addAlcance = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        setStructuredData(prev => ({ ...prev, alcances: [...prev.alcances, val] }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeAlcance = (idx: number) => {
    setStructuredData(prev => ({ ...prev, alcances: prev.alcances.filter((_, i) => i !== idx) }));
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const getUrlsList = () => formData.pdf_url ? formData.pdf_url.split(',').map(u => u.trim()).filter(Boolean) : [];

  const handleRemoveUrl = (urlToRemove: string) => {
    const urls = getUrlsList();
    const newUrls = urls.filter(u => u !== urlToRemove).join(', ');
    setFormData(prev => ({ ...prev, pdf_url: newUrls }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPdf(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;
        const path = `lessons/${moduleId}/${fileName}`;
        
        await uploadFile('pdfs', path, file);
        return getFileUrl('pdfs', path);
      });
      
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => {
        const currentUrls = prev.pdf_url ? prev.pdf_url.split(',').map(u => u.trim()).filter(Boolean) : [];
        const newUrls = [...currentUrls, ...urls].join(', ');
        return { ...prev, pdf_url: newUrls };
      });
    } catch (err) {
      console.error('Error uploading files:', err);
      alert('Error al subir los archivos.');
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
          message={`¿Estás seguro de que deseas eliminar la lección "${lesson.title}"?`}
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
            <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">URL Video</label>
            <input 
              name="video_url" value={formData.video_url || ''} onChange={handleChange}
              className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500 transition-colors placeholder-lms-text-muted"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted mb-1.5">Archivos Adjuntos</label>
            <div className="space-y-2">
              {getUrlsList().length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {getUrlsList().map((url, i) => (
                    <div key={i} className="flex items-center justify-between bg-lms-bg border border-lms-border rounded-lg px-3 py-2">
                      <span className="text-xs truncate">{decodeURIComponent(url.split('/').pop() || '')}</span>
                      <button type="button" onClick={() => handleRemoveUrl(url)} className="text-red-400"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Pegar enlace y Enter"
                  className="flex-1 px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setFormData(prev => ({ ...prev, pdf_url: [...getUrlsList(), val].join(', ') }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <label className="cursor-pointer bg-lms-bg border border-lms-border rounded-lg px-3 flex items-center">
                  {uploadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <input type="file" multiple className="hidden" onChange={handlePdfUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-lms-surface border border-lms-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-lms-text-muted">Contenido de la Lección</label>
            <button
              type="button"
              onClick={() => setUseStructured(!useStructured)}
              className="text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {useStructured ? 'Cambiar a HTML/Texto Plano' : 'Usar Constructor Estructurado'}
            </button>
          </div>

          {useStructured ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-lms-text-primary mb-1">Descripción / Objetivos</label>
                <textarea 
                  value={structuredData.description} 
                  onChange={e => setStructuredData(p => ({ ...p, description: e.target.value }))} 
                  rows={3}
                  className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500"
                  placeholder="Ej: En esta sesión aprenderemos..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-lms-text-primary mb-1">Temas (Presiona Enter para añadir)</label>
                  <div className="space-y-2">
                    {structuredData.temas.length > 0 && (
                      <ul className="space-y-1">
                        {structuredData.temas.map((tema, i) => (
                          <li key={i} className="flex items-center justify-between text-xs bg-lms-bg border border-lms-border rounded-md px-2 py-1">
                            <span className="truncate mr-2">{tema}</span>
                            <button type="button" onClick={() => removeTema(i)} className="text-red-400"><X size={12} /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <input type="text" placeholder="Añadir tema ➔" onKeyDown={addTema} className="w-full px-3 py-1.5 bg-lms-bg border border-lms-border rounded-lg text-xs" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-lms-text-primary mb-1">Alcances (Presiona Enter para añadir)</label>
                  <div className="space-y-2">
                    {structuredData.alcances.length > 0 && (
                      <ul className="space-y-1">
                        {structuredData.alcances.map((alcance, i) => (
                          <li key={i} className="flex items-center justify-between text-xs bg-lms-bg border border-lms-border rounded-md px-2 py-1">
                            <span className="truncate mr-2">{alcance}</span>
                            <button type="button" onClick={() => removeAlcance(i)} className="text-red-400"><X size={12} /></button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <input type="text" placeholder="Añadir alcance ➔" onKeyDown={addAlcance} className="w-full px-3 py-1.5 bg-lms-bg border border-lms-border rounded-lg text-xs" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <textarea 
              name="content" value={formData.content || ''} onChange={handleChange} rows={5}
              className="w-full px-3 py-2 bg-lms-bg border border-lms-border rounded-lg text-sm text-lms-text-primary focus:outline-none focus:border-cyan-500"
              placeholder="Contenido en HTML o texto plano..."
            />
          )}
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
