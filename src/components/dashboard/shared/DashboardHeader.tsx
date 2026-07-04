import { Bell, Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function DashboardHeader({ onMenuClick, title }: DashboardHeaderProps) {
  const { user, role } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
        >
          <Menu size={20} />
        </button>
        {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 leading-none">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
