import { useState, useEffect } from 'react';
import { BookOpen, Users, ListChecks, TrendingUp, ArrowUpRight, Clock, Star } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  publishedCourses: number;
}

interface RecentEnrollment {
  id: string;
  enrolled_at: string;
  profiles: { full_name: string } | null;
  courses: { title: string } | null;
}

type AdminView = 'overview' | 'courses' | 'students' | 'enrollments' | 'settings';

interface OverviewProps {
  onNavigate: (view: AdminView) => void;
}

export function Overview({ onNavigate }: OverviewProps) {
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalStudents: 0, totalEnrollments: 0, publishedCourses: 0 });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, studentsRes, enrollmentsRes, pubRes, recentRes, topRes] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
          supabase.from('enrollments').select('id', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }).eq('published', true),
          supabase.from('enrollments')
            .select('id, enrolled_at, profiles(full_name), courses(title)')
            .order('enrolled_at', { ascending: false })
            .limit(5),
          supabase.from('courses')
            .select('id, title, cover_url, enrollments(count)')
            .eq('published', true)
            .limit(4),
        ]);

        setStats({
          totalCourses: coursesRes.count ?? 0,
          totalStudents: studentsRes.count ?? 0,
          totalEnrollments: enrollmentsRes.count ?? 0,
          publishedCourses: pubRes.count ?? 0,
        });
        setRecentEnrollments((recentRes.data ?? []) as unknown as RecentEnrollment[]);
        setTopCourses(topRes.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      label: 'Cursos Totales',
      value: stats.totalCourses,
      sub: `${stats.publishedCourses} publicados`,
      icon: BookOpen,
      color: 'from-violet-500 to-indigo-600',
      shadow: 'shadow-violet-500/20',
      iconBg: 'bg-violet-500/10 text-violet-400',
      onClick: () => onNavigate('courses'),
    },
    {
      label: 'Estudiantes',
      value: stats.totalStudents,
      sub: 'registrados',
      icon: Users,
      color: 'from-cyan-500 to-sky-600',
      shadow: 'shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      onClick: () => onNavigate('students'),
    },
    {
      label: 'Matrículas',
      value: stats.totalEnrollments,
      sub: 'totales',
      icon: ListChecks,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      onClick: () => onNavigate('enrollments'),
    },
    {
      label: 'Tasa de Conversión',
      value: stats.totalStudents > 0
        ? `${Math.round((stats.totalEnrollments / stats.totalStudents) * 100)}%`
        : '0%',
      sub: 'estudiantes matriculados',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400',
      onClick: () => {},
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 bg-lms-surface rounded-2xl animate-pulse border border-lms-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-lms-text-primary">Dashboard</h1>
        <p className="text-sm text-lms-text-muted mt-1">Resumen en tiempo real de tu academia</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, iconBg, shadow, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`text-left bg-lms-surface border border-lms-border rounded-2xl p-5 hover:border-violet-500/30 hover:bg-lms-hover transition-all duration-200 group shadow-lg ${shadow}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-lms-text-muted group-hover:text-violet-400 transition-colors" />
            </div>
            <p className="text-3xl font-black text-lms-text-primary">{value}</p>
            <p className="text-xs font-bold text-lms-text-muted mt-1 uppercase tracking-wider">{label}</p>
            <p className="text-xs text-lms-text-muted/70 mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Enrollments */}
        <div className="lg:col-span-3 bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-lms-border">
            <h3 className="font-bold text-lms-text-primary text-sm">Últimas Matrículas</h3>
            <button
              onClick={() => onNavigate('enrollments')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <div className="divide-y divide-lms-border">
            {recentEnrollments.length === 0 ? (
              <div className="py-12 text-center text-lms-text-muted text-sm">
                Aún no hay matrículas registradas.
              </div>
            ) : (
              recentEnrollments.map(e => (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3 hover:bg-lms-hover transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {(e.profiles?.full_name ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-lms-text-primary truncate">
                      {e.profiles?.full_name ?? 'Desconocido'}
                    </p>
                    <p className="text-xs text-lms-text-muted truncate">{e.courses?.title ?? '-'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-lms-text-muted shrink-0">
                    <Clock size={11} />
                    {new Date(e.enrolled_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="lg:col-span-2 bg-lms-surface border border-lms-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-lms-border">
            <h3 className="font-bold text-lms-text-primary text-sm">Cursos Populares</h3>
            <Star size={14} className="text-amber-400" />
          </div>
          <div className="divide-y divide-lms-border">
            {topCourses.length === 0 ? (
              <div className="py-12 text-center text-lms-text-muted text-sm">
                Aún no hay cursos publicados.
              </div>
            ) : (
              topCourses.map((course, idx) => (
                <div key={course.id} className="flex items-center gap-3 px-5 py-3 hover:bg-lms-hover transition-colors">
                  <span className="text-lg font-black text-lms-text-muted/40 w-5 shrink-0">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-lms-bg overflow-hidden shrink-0">
                    {course.cover_url
                      ? <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lms-text-muted"><BookOpen size={16} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-lms-text-primary line-clamp-1">{course.title}</p>
                    <p className="text-xs text-lms-text-muted">
                      {course.enrollments?.[0]?.count ?? 0} inscritos
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
