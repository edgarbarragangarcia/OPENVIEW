import { useState } from 'react';
import { BookOpen, Compass, User, LogOut, Menu, X, Bell, ChevronRight, Workflow } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { MyCourses } from './views/MyCourses';
import { LessonViewer } from './views/LessonViewer';
import { CourseDetail } from './views/CourseDetail';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';
import { ProcessCanvas } from './views/ProcessCanvas';
import { StarfieldBackground } from '../../effects/StarfieldBackground';

type StudentView = 'my-courses' | 'explore' | 'canvas' | 'profile';

const NAV = [
  { id: 'my-courses', label: 'Mi Aprendizaje', icon: BookOpen, color: '#0891b2' },
  { id: 'explore',    label: 'Explorar',        icon: Compass,  color: '#8b5cf6' },
  { id: 'profile',    label: 'Mi Perfil',        icon: User,     color: '#10b981' },
];

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<StudentView>('my-courses');
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'ST';
  const inFullscreenView = !!(viewingCourseId || viewingDetailId);
  // The whole student dashboard shell carries the cosmic dark/starfield theme
  const isDarkView = !inFullscreenView;

  const renderContent = () => {
    if (viewingCourseId) {
      return <LessonViewer courseId={viewingCourseId} onBack={() => setViewingCourseId(null)} />;
    }
    if (viewingDetailId) {
      return (
        <CourseDetail
          courseId={viewingDetailId}
          onBack={() => setViewingDetailId(null)}
          onEnter={setViewingCourseId}
          onSelectRelated={setViewingDetailId}
        />
      );
    }
    switch (view) {
      case 'my-courses': return <MyCourses onEnter={setViewingCourseId} onCourseSelect={setViewingDetailId} />;
      case 'explore':    return <Explore onEnroll={() => setView('my-courses')} onCourseSelect={setViewingDetailId} />;
      case 'profile':    return <Profile />;
    }
  };

  const handleNavigate = (v: StudentView) => {
    setView(v);
    setViewingCourseId(null);
    setViewingDetailId(null);
    setSidebarOpen(false);
  };

  return (
    <div className={`relative flex h-screen overflow-hidden font-sans ${isDarkView ? 'bg-[#05070f]' : 'bg-lms-bg'}`}>
      {isDarkView && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <StarfieldBackground density={0.5} />
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      {!inFullscreenView && (
        <aside className={`
          fixed lg:relative z-30 flex flex-col w-64 h-full transition-transform duration-300
          ${isDarkView ? 'bg-white/5 backdrop-blur-xl border-r border-white/10' : 'bg-lms-surface border-r border-lms-border'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className={`flex items-center justify-between px-5 h-16 border-b shrink-0 ${isDarkView ? 'border-white/10' : 'border-lms-border'}`}>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Open View Logo" className="w-14 h-14 object-contain rounded-lg" />
              <div>
                <p className={`font-black text-sm leading-none mb-1 ${isDarkView ? 'text-white' : 'text-lms-text-primary'}`}>OpenView</p>
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest leading-none">Academia</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className={isDarkView ? 'lg:hidden text-slate-400' : 'lg:hidden text-lms-text-muted'}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            <p className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${isDarkView ? 'text-slate-500' : 'text-lms-text-muted'}`}>Menú</p>
            {NAV.map(({ id, label, icon: Icon, color }) => {
              const isActive = view === id && !inFullscreenView;
              return (
                <button
                  key={id}
                  onClick={() => handleNavigate(id as StudentView)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : isDarkView
                        ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                        : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${color}${isActive ? '3a' : '1c'}, ${color}08)`,
                      boxShadow: isActive ? `0 2px 8px ${color}30, inset 0 1px 0 ${color}30` : 'none',
                      border: `1px solid ${color}${isActive ? '30' : '18'}`,
                    }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className={`shrink-0 px-4 py-4 border-t ${isDarkView ? 'border-white/10' : 'border-lms-border'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isDarkView ? 'text-white' : 'text-lms-text-primary'}`}>{user?.email}</p>
                <p className="text-[10px] text-cyan-400 font-semibold">Estudiante</p>
              </div>
              <button onClick={signOut} title="Cerrar sesión" className={`transition-colors p-1 rounded-lg hover:bg-red-400/10 ${isDarkView ? 'text-slate-400 hover:text-red-400' : 'text-lms-text-muted hover:text-red-400'}`}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {!inFullscreenView && (
          <header className={`flex items-center justify-between px-6 h-16 shrink-0 ${isDarkView ? 'bg-white/5 backdrop-blur-xl border-b border-white/10' : 'bg-lms-surface border-b border-lms-border'}`}>
            <button onClick={() => setSidebarOpen(true)} className={isDarkView ? 'lg:hidden text-slate-400 hover:text-white' : 'lg:hidden text-lms-text-muted hover:text-lms-text-primary'}>
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <h2 className={`text-sm font-bold ${isDarkView ? 'text-white' : 'text-lms-text-primary'}`}>
                {NAV.find(n => n.id === view)?.label}
              </h2>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className={`relative p-2 rounded-xl transition-colors ${isDarkView ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover'}`}>
                <Bell size={18} />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
