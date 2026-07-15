import { useState } from 'react';
import { BookOpen, Compass, User, LogOut, Menu, X, Bell, ChevronRight, Workflow } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { MyCourses } from './views/MyCourses';
import { LessonViewer } from './views/LessonViewer';
import { CourseDetail } from './views/CourseDetail';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';
import { ProcessCanvas } from './views/ProcessCanvas';

type StudentView = 'my-courses' | 'explore' | 'canvas' | 'profile';

const NAV = [
  { id: 'my-courses', label: 'Mi Aprendizaje', icon: BookOpen },
  { id: 'explore',    label: 'Explorar',        icon: Compass },
  { id: 'profile',    label: 'Mi Perfil',        icon: User },
];

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<StudentView>('my-courses');
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'ST';
  const inFullscreenView = !!(viewingCourseId || viewingDetailId);

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
    <div className="flex h-screen bg-lms-bg overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      {!inFullscreenView && (
        <aside className={`
          fixed lg:relative z-30 flex flex-col w-64 h-full bg-lms-surface border-r border-lms-border
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-lms-border shrink-0">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Open View Logo" className="w-10 h-10 object-contain rounded-lg mix-blend-multiply" />
              <div>
                <p className="font-black text-sm text-lms-text-primary leading-none mb-1">OpenView</p>
                <p className="text-[10px] text-sky-500 font-bold uppercase tracking-widest leading-none">Academia</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-lms-text-muted">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-lms-text-muted">Menú</p>
            {NAV.map(({ id, label, icon: Icon }) => {
              const isActive = view === id && !inFullscreenView;
              return (
                <button
                  key={id}
                  onClick={() => handleNavigate(id as StudentView)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-lms-text-muted group-hover:text-lms-text-primary transition-colors'} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="shrink-0 px-4 py-4 border-t border-lms-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-lms-text-primary truncate">{user?.email}</p>
                <p className="text-[10px] text-cyan-400 font-semibold">Estudiante</p>
              </div>
              <button onClick={signOut} title="Cerrar sesión" className="text-lms-text-muted hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!inFullscreenView && (
          <header className="flex items-center justify-between px-6 h-16 bg-lms-surface border-b border-lms-border shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-lms-text-muted hover:text-lms-text-primary">
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-bold text-lms-text-primary">
                {NAV.find(n => n.id === view)?.label}
              </h2>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative p-2 rounded-xl text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover transition-colors">
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
