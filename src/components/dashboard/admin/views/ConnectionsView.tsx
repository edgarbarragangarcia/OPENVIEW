import { Fragment, useState, useEffect, useMemo } from 'react';
import { Search, Users, Clock, ChevronDown, ChevronUp, Mail, LogIn } from 'lucide-react';
import { getConnectionStats, UserConnectionStats } from '../../../../lib/loginEvents';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function ConnectionsView() {
  const [stats, setStats] = useState<UserConnectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getConnectionStats();
      setStats(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stats
      .filter(s => s.full_name?.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q))
      .sort((a, b) => {
        if (!a.lastLoginAt && !b.lastLoginAt) return 0;
        if (!a.lastLoginAt) return 1;
        if (!b.lastLoginAt) return -1;
        return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
      });
  }, [stats, search]);

  const totalConnections = stats.reduce((acc, s) => acc + s.count, 0);
  const activeUsers = stats.filter(s => s.count > 0).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-lms-text-primary">Conexiones</h1>
        <p className="text-sm text-lms-text-muted mt-1">Horarios y frecuencia de ingreso de cada usuario</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-lms-surface border border-lms-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
            <LogIn size={20} className="text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-lms-text-primary">{totalConnections}</p>
            <p className="text-xs text-lms-text-muted font-semibold">Conexiones totales</p>
          </div>
        </div>
        <div className="bg-lms-surface border border-lms-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
            <Users size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-lms-text-primary">{activeUsers}</p>
            <p className="text-xs text-lms-text-muted font-semibold">Usuarios que han ingresado</p>
          </div>
        </div>
        <div className="bg-lms-surface border border-lms-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-lms-text-primary">{stats.length}</p>
            <p className="text-xs text-lms-text-muted font-semibold">Usuarios registrados</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lms-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-3 bg-lms-surface border border-lms-border rounded-xl text-sm text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">{error}</div>
      )}

      {/* Table */}
      <div className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-lms-border text-xs uppercase tracking-wider text-lms-text-muted">
                <th className="px-5 py-4 font-bold">Usuario</th>
                <th className="px-5 py-4 font-bold">Email</th>
                <th className="px-5 py-4 font-bold text-center">Rol</th>
                <th className="px-5 py-4 font-bold text-center">Conexiones</th>
                <th className="px-5 py-4 font-bold">Última conexión</th>
                <th className="px-5 py-4 font-bold text-right">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lms-border">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-8 bg-lms-hover rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-lms-text-muted">
                      <Users size={32} className="opacity-30" />
                      <p className="text-sm">{search ? 'Sin resultados.' : 'Aún no hay usuarios registrados.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <Fragment key={s.user_id}>
                    <tr className="hover:bg-lms-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(s.full_name || s.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold text-lms-text-primary">{s.full_name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-lms-text-muted">
                          <Mail size={13} />
                          {s.email}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.role === 'admin' ? 'bg-violet-500/15 text-violet-400' : 'bg-cyan-500/15 text-cyan-400'
                        }`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-black ${
                          s.count > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-lms-hover text-lms-text-muted'
                        }`}>
                          {s.count}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-lms-text-muted">
                          <Clock size={12} />
                          {s.lastLoginAt ? formatDateTime(s.lastLoginAt) : 'Nunca'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {s.recentLogins.length > 0 && (
                          <button
                            onClick={() => setExpanded(expanded === s.user_id ? null : s.user_id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 transition-colors"
                          >
                            {expanded === s.user_id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            Ver
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === s.user_id && (
                      <tr className="bg-lms-bg/50">
                        <td colSpan={6} className="px-5 py-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-lms-text-muted mb-2">
                            Últimas {s.recentLogins.length} conexiones
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {s.recentLogins.map((t, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-lms-hover text-xs text-lms-text-primary font-medium">
                                {formatDateTime(t)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
