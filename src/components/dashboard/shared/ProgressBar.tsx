interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md';
  color?: 'blue' | 'green' | 'purple';
}

const colorMap = {
  blue: 'from-sky-400 to-indigo-500',
  green: 'from-emerald-400 to-teal-500',
  purple: 'from-violet-400 to-purple-600',
};

export function ProgressBar({ value, showLabel = true, size = 'md', color = 'blue' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Progreso</span>
          <span className="text-xs font-bold text-slate-700">{value}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
