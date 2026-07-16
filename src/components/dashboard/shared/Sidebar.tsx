import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  id: string; // Used to determine active state if we handle routing manually
}

interface SidebarProps {
  items: SidebarItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, activeId, onNavigate, isOpen, onClose }: SidebarProps) {
  const { signOut, role } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Open View Logo" className="w-14 h-14 object-contain rounded-lg bg-white" />
            <div>
              <h2 className="text-white font-black leading-none">Open View</h2>
              <span className="text-[10px] uppercase tracking-widest text-sky-500 font-bold">
                {role === 'admin' ? 'Admin Panel' : 'Student Panel'}
              </span>
            </div>
          </div>
          <button className="lg:hidden p-1 hover:bg-white/10 rounded-md" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                    : 'hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
