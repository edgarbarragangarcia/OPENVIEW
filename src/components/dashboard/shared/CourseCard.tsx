import { Play, Clock, BarChart } from 'lucide-react';
import { Course } from '../../../lib/courses';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: Course;
  progress?: number;
  onClick?: (course: Course) => void;
  actionLabel?: string;
}

export function CourseCard({ course, progress, onClick, actionLabel = 'Continuar' }: CourseCardProps) {
  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onClick && onClick(course)}
    >
      <div className="aspect-video relative overflow-hidden bg-slate-100">
        {course.cover_url ? (
          <img 
            src={course.cover_url} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
            <Play size={48} className="text-sky-300/50" />
          </div>
        )}
        {course.categories && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
            {course.categories.name}
          </div>
        )}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
            <Play size={24} className="text-sky-500 ml-1" />
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
          {course.title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            {course.duration_hrs}h
          </div>
          <div className="flex items-center gap-1.5 capitalize">
            <BarChart size={14} />
            {course.level}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50">
          {progress !== undefined ? (
            <ProgressBar value={progress} size="sm" />
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900">
                {course.price > 0 ? `$${course.price}` : 'Gratis'}
              </span>
              <span className="text-sm font-bold text-sky-500 uppercase tracking-wide">
                {actionLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
