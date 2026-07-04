import { useState } from 'react';
import { BookOpen, Compass, User, LogOut, Menu, X, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { MyCourses } from './views/MyCourses';
import { LessonViewer } from './views/LessonViewer';
import { Explore } from './views/Explore';

type StudentView = 'my-courses' | 'explore' | 'profile';

const NAV = [
  { id: 'my-courses', label: 'Mi Aprendizaje', icon: BookOpen },
  { id: 'explore',    label: 'Explorar',        icon: Compass },
  { id: 'profile',    label: 'Mi Perfil',        icon: User },
];

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<StudentView>('my-courses');
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'ST';

  const renderContent = () => {
    if (viewingCourseId) {
      return <LessonViewer courseId={viewingCourseId} onBack={() => setViewingCourseId(null)} />;
    }
    switch (view) {
      case 'my-courses': return <MyCourses onCourseSelect={setViewingCourseId} />;
      case 'explore':    return <Explore onEnroll={() => setView('my-courses')} onCourseSelect={setViewingCourseId} />;
      case 'profile':    return <ProfileView />;
    }
  };

  const handleNavigate = (v: StudentView) => {
    setView(v);
    setViewingCourseId(null);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-lms-bg overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      {!viewingCourseId && (
        <aside className={`
          fixed lg:relative z-30 flex flex-col w-64 h-full bg-lms-surface border-r border-lms-border
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-lms-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <p className="font-black text-sm text-lms-text-primary">OpenView</p>
                <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest">Academia</p>
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
              const isActive = view === id && !viewingCourseId;
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
        {!viewingCourseId && (
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

function ProfileView() {
  const { user } = useAuth();
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-lms-text-primary mb-6">Mi Perfil</h1>
      <div className="bg-lms-surface border border-lms-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            {user?.email?.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lms-text-primary">{user?.email}</p>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">Estudiante</p>
          </div>
        </div>
        <div className="pt-4 border-t border-lms-border">
          <p className="text-xs text-lms-text-muted">Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('es') : '—'}</p>
        </div>
      </div>
    </div>
  );
}
