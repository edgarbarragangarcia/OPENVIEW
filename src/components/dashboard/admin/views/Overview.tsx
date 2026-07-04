import { useState, useEffect } from 'react';
import { BookOpen, Users, Award } from 'lucide-react';
import { StatCard } from '../../shared/StatCard';
import { getAdminStats } from '../../../../lib/courses';

export function Overview() {
  const [stats, setStats] = useState({ totalCourses: 0, totalEnrollments: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Cargando resumen...</div>;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Panel de Control</h1>
        <p className="text-slate-500">Resumen general de tu academia</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Cursos Activos"
          value={stats.totalCourses}
          icon={<BookOpen size={24} />}
          trend="+2"
          trendUp={true}
        />
        <StatCard
          title="Estudiantes"
          value={stats.totalStudents}
          icon={<Users size={24} />}
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Inscripciones Totales"
          value={stats.totalEnrollments}
          icon={<Award size={24} />}
          trend="+5%"
          trendUp={true}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
            <p>Pronto: Gráfico de actividad</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Últimas Inscripciones</h3>
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
            <p>Aún no hay inscripciones recientes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
