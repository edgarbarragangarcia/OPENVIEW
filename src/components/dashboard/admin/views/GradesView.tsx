import { useState, useEffect } from 'react';
import { Search, Trophy, Mail, Clock, BookOpen, ChevronDown, UserX } from 'lucide-react';
import { getAllQuizResults, type AdminQuizResult } from '../../../../lib/quizResults';
import { getAllEnrollments } from '../../../../lib/enrollments';

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

interface StudentGroup {
  userId: string;
  fullName: string;
  email: string;
  attempts: AdminQuizResult[];
}

interface CourseGroup {
  courseId: string;
  title: string;
  students: StudentGroup[];
}

export function GradesView() {
  const [results, setResults] = useState<AdminQuizResult[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Groups start collapsed; a course key is added here only once the admin expands it.
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  useEffect(() => {
    Promise.all([getAllQuizResults(), getAllEnrollments()])
      .then(([r, e]) => { setResults(r); setEnrollments(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgPct = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / results.length)
    : 0;

  // Build one group per course, containing every enrolled student (with or without attempts).
  const courseGroups: CourseGroup[] = [];
  const courseIndex = new Map<string, CourseGroup>();

  for (const e of enrollments) {
    const courseId = e.course_id;
    if (!courseId) continue;
    if (!courseIndex.has(courseId)) {
      const group: CourseGroup = { courseId, title: e.courses?.title ?? 'Sin curso', students: [] };
      courseIndex.set(courseId, group);
      courseGroups.push(group);
    }
    courseIndex.get(courseId)!.students.push({
      userId: e.user_id,
      fullName: e.profiles?.full_name || 'Estudiante',
      email: e.profiles?.email || '',
      attempts: [],
    });
  }

  for (const r of results) {
    const courseId = r.lessons?.modules?.courses?.id;
    if (!courseId) continue;
    const group = courseIndex.get(courseId);
    if (!group) continue;
    const student = group.students.find(s => s.userId === r.user_id);
    if (student) student.attempts.push(r);
  }

  courseGroups.sort((a, b) => a.title.localeCompare(b.title));

  const q = search.toLowerCase();
  const filteredGroups = courseGroups
    .map(g => ({
      ...g,
      students: g.students.filter(s =>
        !q ||
        g.title.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.attempts.some(a => a.lessons?.title.toLowerCase().includes(q))
      ),
    }))
    .filter(g => g.students.length > 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-lms-text-primary">Calificaciones</h1>
          <p className="text-sm text-lms-text-muted mt-1">
            {results.length} intento{results.length !== 1 ? 's' : ''} de evaluación registrado{results.length !== 1 ? 's' : ''}
          </p>
        </div>
        {results.length > 0 && (
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

      {/* Grouped by course, collapsible */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-lms-surface border border-lms-border rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-lms-surface border border-lms-border rounded-2xl px-5 py-14 text-center text-lms-text-muted text-sm">
          {search ? 'Sin resultados.' : 'No hay estudiantes matriculados todavía.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map(group => {
            const isCollapsed = !expandedCourses.has(group.courseId);
            const withAttempts = group.students.filter(s => s.attempts.length > 0).length;
            return (
              <div key={group.courseId} className="bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleCourse(group.courseId)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-lms-hover transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <BookOpen size={16} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-lms-text-primary truncate">{group.title}</p>
                      <p className="text-xs text-lms-text-muted">
                        {group.students.length} estudiante{group.students.length !== 1 ? 's' : ''} · {withAttempts} con evaluaciones
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-lms-text-muted shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-lms-border border-t border-lms-border">
                    {group.students.map(s => (
                      <div key={s.userId} className="px-5 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(s.fullName || s.email || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="text-sm font-bold text-lms-text-primary">{s.fullName}</p>
                              {s.email && (
                                <span className="flex items-center gap-1 text-xs text-lms-text-muted">
                                  <Mail size={11} /> {s.email}
                                </span>
                              )}
                            </div>

                            {s.attempts.length === 0 ? (
                              <p className="mt-2 flex items-center gap-1.5 text-xs text-lms-text-muted">
                                <UserX size={12} /> Sin evaluaciones aún
                              </p>
                            ) : (
                              <div className="mt-2.5 space-y-2">
                                {s.attempts.map(a => {
                                  const pct = Math.round((a.score / a.total) * 100);
                                  const style = scoreColor(pct);
                                  return (
                                    <div key={a.id} className="flex flex-wrap items-center gap-2">
                                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-black ${style.bg} ${style.border} ${style.text}`}>
                                        {a.score}/{a.total} ({pct}%)
                                      </span>
                                      <span className="text-xs text-lms-text-muted">
                                        {a.lessons?.modules?.title ?? '—'} › {a.lessons?.title ?? '—'}
                                      </span>
                                      <span className="flex items-center gap-1 text-xs text-lms-text-muted/70">
                                        <Clock size={10} /> {timeAgo(a.created_at)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
