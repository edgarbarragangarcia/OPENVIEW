import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Edit3, Trash2, Plus, GripVertical, ArrowRight } from 'lucide-react';
import { Module, Lesson, updateModule, deleteModule, updateLesson } from '../../../../lib/courses';
import { LessonBuilder } from './LessonBuilder';
import { ConfirmModal } from '../../shared/Modals';

interface ModuleBuilderProps {
  courseId: string;
  module: Module;
  onRefresh: () => void;
  /** Lesson currently being dragged (from parent) */
  draggedLesson: { lessonId: string; fromModuleId: string } | null;
  onLessonDragStart: (lessonId: string, fromModuleId: string) => void;
  onLessonDragEnd: () => void;
  onLessonDrop: (lessonId: string, fromModuleId: string, toModuleId: string) => Promise<void>;
}

export function ModuleBuilder({
  courseId,
  module,
  onRefresh,
  draggedLesson,
  onLessonDragStart,
  onLessonDragEnd,
  onLessonDrop,
}: ModuleBuilderProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localLessons, setLocalLessons] = useState<Lesson[]>([]);

  // Within-module reorder state
  const [localDragIdx, setLocalDragIdx] = useState<number | null>(null);
  const [localOverIdx, setLocalOverIdx] = useState<number | null>(null);

  // Cross-module drop-zone state
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    setLocalLessons(
      module.lessons ? [...module.lessons].sort((a, b) => a.position - b.position) : []
    );
  }, [module.lessons]);

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

  // ── Within-module reorder ──────────────────────────────────────
  const handleLessonDragStart = (e: React.DragEvent, lessonId: string, idx: number) => {
    setLocalDragIdx(idx);
    onLessonDragStart(lessonId, module.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLessonDragOverItem = (e: React.DragEvent, overIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedLesson?.fromModuleId === module.id) {
      setLocalOverIdx(overIdx);
    }
  };

  const handleLessonDropOnItem = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      localDragIdx !== null &&
      localOverIdx !== null &&
      localDragIdx !== localOverIdx &&
      draggedLesson?.fromModuleId === module.id
    ) {
      const newLessons = [...localLessons];
      const [moved] = newLessons.splice(localDragIdx, 1);
      newLessons.splice(localOverIdx, 0, moved);
      setLocalLessons(newLessons);
      Promise.all(newLessons.map((l, i) => updateLesson(l.id, { position: i }))).then(onRefresh);
    }
    setLocalDragIdx(null);
    setLocalOverIdx(null);
    onLessonDragEnd();
  };

  const handleLessonDragEnd = () => {
    setLocalDragIdx(null);
    setLocalOverIdx(null);
    onLessonDragEnd();
  };

  // ── Cross-module drop zone ─────────────────────────────────────
  const isCrossModuleDrag = !!(draggedLesson && draggedLesson.fromModuleId !== module.id);

  const handleModuleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (isCrossModuleDrag) setIsDragOver(true);
  };

  const handleModuleDragLeave = () => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragOver(false);
  };

  const handleModuleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleModuleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    if (draggedLesson && draggedLesson.fromModuleId !== module.id) {
      await onLessonDrop(draggedLesson.lessonId, draggedLesson.fromModuleId, module.id);
    }
  };

  return (
    <div
      className={`border rounded-2xl bg-lms-surface overflow-hidden shadow-sm transition-all duration-200 ${
        isDragOver
          ? 'border-cyan-400 shadow-xl shadow-cyan-400/20 ring-2 ring-cyan-400/30'
          : 'border-lms-border'
      }`}
      onDragEnter={handleModuleDragEnter}
      onDragLeave={handleModuleDragLeave}
      onDragOver={handleModuleDragOver}
      onDrop={handleModuleDrop}
    >
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Módulo"
        message={`¿Estás seguro de que deseas eliminar el módulo "${module.title}" y TODAS sus lecciones? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar Módulo"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Module header */}
      <div className="flex items-center gap-3 p-4 bg-lms-surface border-b border-lms-border group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-lms-text-muted hover:text-cyan-400 transition-colors p-1"
        >
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className="flex-1 flex items-center gap-2">
          {isEditing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              className="flex-1 px-3 py-1.5 text-sm font-bold bg-lms-bg border border-cyan-500 rounded-lg focus:outline-none text-lms-text-primary shadow-inner"
            />
          ) : (
            <span className="font-bold text-lms-text-primary group-hover:text-cyan-400 transition-colors">
              {module.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-lms-text-muted hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-lms-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-lms-bg space-y-3 relative">

          {/* Cross-module drop overlay */}
          {isCrossModuleDrag && (
            <div
              className={`absolute inset-0 rounded-b-2xl z-20 pointer-events-none transition-all duration-150 flex items-center justify-center ${
                isDragOver
                  ? 'bg-cyan-400/10 border-2 border-dashed border-cyan-400'
                  : 'border-2 border-dashed border-transparent'
              }`}
            >
              {isDragOver && (
                <div className="flex items-center gap-2 bg-cyan-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/30">
                  <ArrowRight size={16} /> Mover a este bloque
                </div>
              )}
            </div>
          )}

          {/* Lesson list */}
          <div className="space-y-2">
            {localLessons.map((lesson, idx) => {
              const isBeingDragged = localDragIdx === idx;
              const isDropTarget =
                localOverIdx === idx &&
                localDragIdx !== null &&
                localDragIdx !== idx &&
                draggedLesson?.fromModuleId === module.id;

              return (
                <div key={lesson.id} className="relative">
                  {/* Insert indicator line */}
                  {isDropTarget && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-cyan-400 rounded-full z-10 shadow-sm shadow-cyan-400/50" />
                  )}

                  <div
                    draggable={editingLessonId !== lesson.id}
                    onDragStart={e => handleLessonDragStart(e, lesson.id, idx)}
                    onDragOver={e => handleLessonDragOverItem(e, idx)}
                    onDrop={handleLessonDropOnItem}
                    onDragEnd={handleLessonDragEnd}
                    className={`transition-all duration-150 ${isBeingDragged ? 'opacity-40 scale-[0.98]' : ''}`}
                  >
                    {editingLessonId === lesson.id ? (
                      <LessonBuilder
                        moduleId={module.id}
                        lesson={lesson}
                        onSaved={() => { setEditingLessonId(null); onRefresh(); }}
                        onCancel={() => setEditingLessonId(null)}
                        onRefresh={onRefresh}
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-lms-surface border border-lms-border rounded-xl shadow-sm group/item hover:border-cyan-500/30 hover:shadow-cyan-500/5 transition-all cursor-grab active:cursor-grabbing">
                        <div className="flex items-center gap-3">
                          <div className="text-lms-text-muted/30 group-hover/item:text-cyan-400 transition-colors">
                            <GripVertical size={16} />
                          </div>
                          <span className="text-sm font-semibold text-lms-text-primary">
                            {lesson.title}
                          </span>
                          {lesson.is_free && (
                            <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Gratis
                            </span>
                          )}
                          {lesson.video_url?.includes('.pdf') && (
                            <span className="text-[10px] uppercase font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                              PDF
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingLessonId(lesson.id)}
                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add lesson */}
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
