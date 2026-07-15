import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Workflow, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { listCanvases, createCanvas, deleteCanvas, type CanvasRecord } from '../../../../lib/canvas';

interface CanvasListViewProps {
  courseId?: string;
  onOpen: (canvasId: string) => void;
  onBack: () => void;
}

export function CanvasListView({ courseId, onOpen, onBack }: CanvasListViewProps) {
  const [canvases, setCanvases] = useState<CanvasRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    listCanvases(courseId)
      .then(setCanvases)
      .catch(err => {
        console.error(err);
        toast.error('No se pudieron cargar tus canvas');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const canvas = await createCanvas(courseId, `Canvas de Procesos ${canvases.length + 1}`);
      onOpen(canvas.id);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo crear el canvas');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este canvas y todo su contenido? Esta acción no se puede deshacer.')) return;
    try {
      await deleteCanvas(id);
      setCanvases(prev => prev.filter(c => c.id !== id));
      toast.success('Canvas eliminado');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar el canvas');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-5 h-16 bg-white border-b border-slate-200 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-600 font-semibold transition-colors">
          <ArrowLeft size={14} /> Volver
        </button>
        <h2 className="flex-1 text-sm font-black text-slate-800 flex items-center gap-2 justify-center">
          <Workflow size={16} className="text-cyan-500" /> Mis Canvas de Procesos
        </h2>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow disabled:opacity-60"
        >
          {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Nuevo Canvas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          </div>
        ) : canvases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <Workflow size={32} className="text-slate-300" />
            <p className="text-sm text-slate-500">Todavía no tienes ningún canvas de procesos.</p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow disabled:opacity-60"
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Crear mi primer canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canvases.map(c => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="group text-left rounded-2xl border border-slate-200 bg-white p-4 hover:border-cyan-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0">
                    <Workflow size={16} />
                  </div>
                  <button
                    onClick={e => handleDelete(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Eliminar canvas"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-3 line-clamp-2">{c.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Actualizado el {new Date(c.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
