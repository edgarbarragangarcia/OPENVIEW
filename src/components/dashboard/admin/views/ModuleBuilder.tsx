import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, Trash2, Plus, ChevronUp } from 'lucide-react';
import { Module, Lesson, updateModule, deleteModule, updateLesson } from '../../../../lib/courses';
import { LessonBuilder } from './LessonBuilder';
import { ConfirmModal } from '../../shared/Modals';

interface ModuleBuilderProps {
  courseId: string;
  module: Module;
  onRefresh: () => void;
}

export function ModuleBuilder({ courseId, module, onRefresh }: ModuleBuilderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    await updateModule(module.id, { title });
    setIsEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    await deleteModule(module.id);
    onRefresh();
  };

  const handleMoveLesson = async (index: number, direction: 'up' | 'down') => {
    if (!module.lessons) return;
    const sorted = [...module.lessons].sort((a,b) => a.position - b.position);
    
    if (direction === 'up' && index > 0) {
      const current = sorted[index];
      const previous = sorted[index - 1];
      const tempPos = current.position;
      await updateLesson(current.id, { position: previous.position });
      await updateLesson(previous.id, { position: tempPos });
      onRefresh();
    } else if (direction === 'down' && index < sorted.length - 1) {
      const current = sorted[index];
      const next = sorted[index + 1];
      const tempPos = current.position;
      await updateLesson(current.id, { position: next.position });
      await updateLesson(next.id, { position: tempPos });
      onRefresh();
    }
  };

  const sortedLessons = module.lessons ? [...module.lessons].sort((a,b) => a.position - b.position) : [];

  return (
    <div className="border border-lms-border rounded-2xl bg-lms-surface overflow-hidden shadow-sm">
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Módulo"
        message={`¿Estás seguro de que deseas eliminar el módulo "${module.title}" y TODAS sus lecciones? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar Módulo"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="flex items-center gap-3 p-4 bg-lms-surface border-b border-lms-border group">
        <button onClick={() => setIsOpen(!isOpen)} className="text-lms-text-muted hover:text-cyan-400 transition-colors p-1">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <div className="flex-1 flex items-center gap-2">
          {isEditing ? (
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              onBlur={handleSaveTitle} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              className="flex-1 px-3 py-1.5 text-sm font-bold bg-lms-bg border border-cyan-500 rounded-lg focus:outline-none text-lms-text-primary shadow-inner"
            />
          ) : (
            <span className="font-bold text-lms-text-primary group-hover:text-cyan-400 transition-colors">{module.title}</span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-lms-text-muted hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-lms-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-lms-bg space-y-3">
          {sortedLessons.map((lesson: Lesson, idx: number) => (
            <div key={lesson.id}>
              {editingLessonId === lesson.id ? (
                <LessonBuilder 
                  moduleId={module.id} 
                  lesson={lesson} 
                  onSaved={() => { setEditingLessonId(null); onRefresh(); }} 
                  onCancel={() => setEditingLessonId(null)} 
                  onRefresh={onRefresh}
                />
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-lms-surface border border-lms-border rounded-xl shadow-sm group hover:border-cyan-500/30 hover:shadow-cyan-500/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center mr-1">
                      <button 
                        onClick={() => handleMoveLesson(idx, 'up')}
                        disabled={idx === 0}
                        className="text-lms-text-muted hover:text-cyan-400 disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button 
                        onClick={() => handleMoveLesson(idx, 'down')}
                        disabled={idx === sortedLessons.length - 1}
                        className="text-lms-text-muted hover:text-cyan-400 disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-lms-text-primary">{lesson.title}</span>
                    {lesson.is_free && <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Gratis</span>}
                    {lesson.video_url?.includes('.pdf') && <span className="text-[10px] uppercase font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">PDF</span>}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingLessonId(lesson.id)} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors">
                      Editar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingLesson ? (
            <LessonBuilder 
              moduleId={module.id} 
              onSaved={() => { setAddingLesson(false); onRefresh(); }} 
              onCancel={() => setAddingLesson(false)} 
              onRefresh={onRefresh}
            />
          ) : (
            <button 
              onClick={() => setAddingLesson(true)}
              className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-lms-border rounded-xl text-sm font-bold text-lms-text-muted hover:bg-lms-hover hover:text-cyan-400 hover:border-cyan-500/30 transition-colors mt-2"
            >
              <Plus size={18} /> Añadir Lección / Archivo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
