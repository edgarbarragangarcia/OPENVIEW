import { useState, useEffect } from 'react';
import { Search, Trophy, Mail, Clock, BookOpen } from 'lucide-react';
import { getAllQuizResults, type AdminQuizResult } from '../../../../lib/quizResults';

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

function scoreColor(pct: number) {
  if (pct === 100) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (pct >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
}

export function GradesView() {
  const [items, setItems] = useState<AdminQuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllQuizResults()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.profiles?.full_name?.toLowerCase().includes(q) ||
      r.profiles?.email?.toLowerCase().includes(q) ||
      r.lessons?.title.toLowerCase().includes(q) ||
      r.lessons?.modules?.courses?.title.toLowerCase().includes(q)
    );
  });

  const avgPct = items.length > 0
    ? Math.round(items.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / items.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-lms-text-primary">Calificaciones</h1>
          <p className="text-sm text-lms-text-muted mt-1">
            {items.length} intento{items.length !== 1 ? 's' : ''} de evaluación registrado{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lms-surface border border-lms-border">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-lms-text-primary">{avgPct}%</span>
            <span className="text-xs text-lms-text-muted">promedio general</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por estudiante, curso o sesión..."
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
              <Trophy size={32} className="opacity-30" />
              <p className="text-sm">{search ? 'Sin resultados.' : 'Ningún estudiante ha completado una evaluación todavía.'}</p>
            </div>
          </div>
        ) : (
          filtered.map(r => {
            const pct = Math.round((r.score / r.total) * 100);
            const style = scoreColor(pct);
            return (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-lms-hover/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(r.profiles?.full_name || r.profiles?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-bold text-lms-text-primary">{r.profiles?.full_name || 'Estudiante'}</p>
                    {r.profiles?.email && (
                      <span className="flex items-center gap-1 text-xs text-lms-text-muted">
                        <Mail size={11} /> {r.profiles.email}
                      </span>
                    )}
                  </div>
                  {r.lessons && (
                    <p className="text-xs text-lms-text-muted mt-1.5 flex items-center gap-1.5">
                      <BookOpen size={11} />
                      {r.lessons.modules?.courses?.title ?? '—'} › {r.lessons.modules?.title ?? '—'} › {r.lessons.title}
                    </p>
                  )}
                </div>
                <div className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-black ${style.bg} ${style.border} ${style.text}`}>
                  {r.score}/{r.total} ({pct}%)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-lms-text-muted shrink-0">
                  <Clock size={11} />
                  {timeAgo(r.created_at)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
