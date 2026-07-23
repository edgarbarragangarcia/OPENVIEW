import { useState } from 'react';
import { BookOpen, Compass, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsMobile } from '../../../lib/useIsMobile';
import { usePersistentState } from '../../../lib/usePersistentState';
import { MyCourses } from './views/MyCourses';
import { LessonViewer } from './views/LessonViewer';
import { CourseDetail } from './views/CourseDetail';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';
import { ProcessCanvas } from './views/ProcessCanvas';

type StudentView = 'my-courses' | 'explore' | 'canvas' | 'profile';

const NAV = [
  { id: 'my-courses', label: 'Mi Aprendizaje', icon: BookOpen, color: '#0891b2' },
  { id: 'explore',    label: 'Explorar',        icon: Compass,  color: '#8b5cf6' },
  { id: 'profile',    label: 'Mi Perfil',        icon: User,     color: '#10b981' },
];

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const scope = user?.id ?? 'anon';
  // Persistimos la navegación para que al recargar se quede en la misma pantalla.
  const [view, setView] = usePersistentState<StudentView>(`ov:student:${scope}:view`, 'my-courses');
  const [viewingCourseId, setViewingCourseId] = usePersistentState<string | null>(`ov:student:${scope}:course`, null);
  const [viewingDetailId, setViewingDetailId] = usePersistentState<string | null>(`ov:student:${scope}:detail`, null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  // En PC el sidebar queda colapsado (solo iconos) y se expande al pasar el mouse.
  // En móvil/tablet (<lg) es un drawer que siempre muestra el contenido completo.
  const isBelowLg = useIsMobile('(max-width: 1023px)');
  const expanded = isBelowLg ? true : desktopExpanded;

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
    <div className="relative flex h-screen overflow-hidden font-sans bg-lms-bg">
      {/* Mobile overlay (oscurece la página detrás del drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      {!inFullscreenView && (
        <aside
          onMouseEnter={() => setDesktopExpanded(true)}
          onMouseLeave={() => setDesktopExpanded(false)}
          className={`
            fixed lg:absolute lg:top-0 lg:left-0 z-30 flex flex-col h-full w-64 overflow-hidden
            transition-[width,transform] duration-300 ease-out
            bg-lms-surface border-r border-lms-border
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${expanded ? 'lg:w-64 lg:shadow-2xl lg:shadow-black/40' : 'lg:w-20'}
          `}
        >
          {/* Logo */}
          <div className={`flex items-center h-16 border-b border-lms-border shrink-0 ${expanded ? 'justify-between px-5' : 'justify-center px-2'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="Open View Logo" className="h-10 w-auto object-contain shrink-0" />
              {expanded && (
                <div className="min-w-0">
                  <p className="font-black text-sm leading-none mb-1 text-lms-text-primary">OpenView</p>
                  <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest leading-none">Academia</p>
                </div>
              )}
            </div>
            {expanded && (
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-lms-text-muted">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            <p className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-lms-text-muted ${expanded ? '' : 'lg:opacity-0'}`}>Menú</p>
            {NAV.map(({ id, label, icon: Icon, color }) => {
              const isActive = view === id && !inFullscreenView;
              return (
                <button
                  key={id}
                  onClick={() => handleNavigate(id as StudentView)}
                  title={label}
                  className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${expanded ? 'px-3' : 'px-0 justify-center'} ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
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
                  {expanded && (
                    <>
                      <span className="truncate">{label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className={`shrink-0 py-4 border-t border-lms-border ${expanded ? 'px-4' : 'px-2'}`}>
            <div className={`flex items-center gap-3 ${expanded ? '' : 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20 shrink-0">
                {initials}
              </div>
              {expanded && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-lms-text-primary">{user?.email}</p>
                    <p className="text-[10px] text-cyan-400 font-semibold">Estudiante</p>
                  </div>
                  <button onClick={signOut} title="Cerrar sesión" className="transition-colors p-1 rounded-lg hover:bg-red-400/10 text-lms-text-muted hover:text-red-400">
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* MAIN — se desenfoca detrás del drawer abierto en móvil */}
      <div className={`relative z-10 flex-1 flex flex-col overflow-hidden transition-[filter] duration-300 ${!inFullscreenView ? 'lg:pl-20' : ''} ${sidebarOpen ? 'blur-sm lg:blur-none' : ''}`}>
        {!inFullscreenView && (
          <header className="flex items-center justify-between px-6 h-16 shrink-0 bg-lms-surface border-b border-lms-border">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-lms-text-muted hover:text-lms-text-primary">
              <Menu size={22} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-bold text-lms-text-primary">
                {NAV.find(n => n.id === view)?.label}
              </h2>
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
