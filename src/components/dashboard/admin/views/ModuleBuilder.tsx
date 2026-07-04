import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, Trash2, Plus, GripVertical } from 'lucide-react';
import { Module, Lesson, createModule, updateModule, deleteModule } from '../../../../lib/courses';
import { LessonBuilder } from './LessonBuilder';

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

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    await updateModule(module.id, { title });
    setIsEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return;
    await deleteModule(module.id);
    onRefresh();
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4 bg-slate-50 border-b border-slate-100">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-700">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <div className="flex-1 flex items-center gap-2">
          {isEditing ? (
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              onBlur={handleSaveTitle} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              className="flex-1 px-2 py-1 text-sm font-bold bg-white border border-slate-300 rounded focus:outline-none focus:border-sky-500"
            />
          ) : (
            <span className="font-bold text-slate-800">{module.title}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 text-slate-400 hover:text-sky-500 rounded-md transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          {module.lessons?.sort((a,b) => a.position - b.position).map((lesson: Lesson) => (
            <div key={lesson.id}>
              {editingLessonId === lesson.id ? (
                <LessonBuilder 
                  moduleId={module.id} 
                  lesson={lesson} 
                  onSaved={() => { setEditingLessonId(null); onRefresh(); }} 
                  onCancel={() => setEditingLessonId(null)} 
                />
              ) : (
                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm group hover:border-sky-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-slate-300 cursor-grab" />
                    <span className="text-sm font-medium text-slate-700">{lesson.title}</span>
                    {lesson.is_free && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Gratis</span>}
                    {lesson.video_url && lesson.video_url.includes('.pdf') && <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">PDF</span>}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingLessonId(lesson.id)} className="text-xs font-bold text-sky-500 hover:text-sky-600">Editar</button>
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
            />
          ) : (
            <button 
              onClick={() => setAddingLesson(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-300 transition-colors"
            >
              <Plus size={16} /> Añadir Lección / Archivo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
