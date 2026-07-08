import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Mail, Clock, BookOpen } from 'lucide-react';
import { getNotUnderstoodFeedback, type AdminTopicFeedback } from '../../../../lib/topicFeedback';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function StudentFeedbackView() {
  const [items, setItems] = useState<AdminTopicFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getNotUnderstoodFeedback()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(f => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      f.profiles?.full_name?.toLowerCase().includes(q) ||
      f.profiles?.email?.toLowerCase().includes(q) ||
      f.topic_text.toLowerCase().includes(q) ||
      f.lessons?.title.toLowerCase().includes(q) ||
      f.lessons?.modules?.courses?.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-lms-text-primary">Dudas de Estudiantes</h1>
        <p className="text-sm text-lms-text-muted mt-1">
          {items.length} tema{items.length !== 1 ? 's' : ''} marcado{items.length !== 1 ? 's' : ''} como "No entendido" en el kanban de las lecciones
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por estudiante, tema o curso..."
          className="w-full pl-10 pr-4 py-3 bg-lms-surface border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* List */}
      <div className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden divide-y divide-lms-border">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="px-5 py-4">
              <div className="h-10 bg-lms-hover rounded-lg animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-lms-text-muted">
              <AlertTriangle size={32} className="opacity-30" />
              <p className="text-sm">{search ? 'Sin resultados.' : 'Ningún estudiante ha marcado temas como "no entendido" todavía.'}</p>
            </div>
          </div>
        ) : (
          filtered.map(f => (
            <div key={f.id} className="flex items-start gap-4 px-5 py-4 hover:bg-lms-hover/50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {(f.profiles?.full_name || f.profiles?.email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-bold text-lms-text-primary">{f.profiles?.full_name || 'Estudiante'}</p>
                  {f.profiles?.email && (
                    <span className="flex items-center gap-1 text-xs text-lms-text-muted">
                      <Mail size={11} /> {f.profiles.email}
                    </span>
                  )}
                </div>
                <p className="text-sm text-rose-400 font-semibold mt-1.5 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  {f.topic_text}
                </p>
                {f.lessons && (
                  <p className="text-xs text-lms-text-muted mt-1.5 flex items-center gap-1.5">
                    <BookOpen size={11} />
                    {f.lessons.modules?.courses?.title ?? '—'} › {f.lessons.modules?.title ?? '—'} › {f.lessons.title}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-lms-text-muted shrink-0">
                <Clock size={11} />
                {timeAgo(f.updated_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
