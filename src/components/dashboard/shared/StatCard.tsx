import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
        <div className="p-3 bg-sky-50 text-sky-500 rounded-xl">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-sm">
          <span className={`font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend}
          </span>
          <span className="text-slate-400">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
