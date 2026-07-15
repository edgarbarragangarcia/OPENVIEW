import { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard, BookOpen, Users, ListChecks, AlertTriangle,
  Settings, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Overview } from './views/Overview';
import { CoursesManager } from './views/CoursesManager';
import { StudentsView } from './views/StudentsView';
import { EnrollmentsView } from './views/EnrollmentsView';
import { StudentFeedbackView } from './views/StudentFeedbackView';
import { CourseForm } from './views/CourseForm';

type AdminView = 'overview' | 'courses' | 'students' | 'enrollments' | 'feedback' | 'settings';

const PRINCIPAL_COUNT = 5;

const NAV = [
  { id: 'overview',     label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'courses',      label: 'Cursos',       icon: BookOpen },
  { id: 'students',     label: 'Estudiantes',  icon: Users },
  { id: 'enrollments',  label: 'Matrículas',   icon: ListChecks },
  { id: 'feedback',     label: 'Dudas',        icon: AlertTriangle },
  { id: 'settings',     label: 'Configuración',icon: Settings },
];

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<AdminView>('overview');
  const [editingCourseId, setEditingCourseId] = useState<string | null | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleEditCourse = (id?: string) => setEditingCourseId(id ?? null);
  const handleBackFromCourse = () => setEditingCourseId(undefined);

  const renderView = () => {
    if (editingCourseId !== undefined) {
      return <CourseForm courseId={editingCourseId ?? undefined} onBack={handleBackFromCourse} />;
    }
    switch (view) {
      case 'overview':    return <Overview onNavigate={(v: AdminView) => setView(v)} />;
      case 'courses':     return <CoursesManager onEdit={handleEditCourse} />;
      case 'students':    return <StudentsView />;
      case 'enrollments': return <EnrollmentsView />;
      case 'feedback':    return <StudentFeedbackView />;
      case 'settings':    return <div className="p-8 text-lms-text-muted">Configuración próximamente.</div>;
    }
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <div className="flex h-screen bg-lms-bg text-lms-text-primary overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
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
                <p className="font-black text-sm text-lms-text-primary tracking-wide leading-none mb-1">OpenView</p>
                <p className="text-[10px] text-violet-500 font-bold uppercase tracking-widest leading-none">Admin</p>
              </div>
            </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-lms-text-muted hover:text-lms-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-lms-text-muted">Principal</p>
          {NAV.slice(0, PRINCIPAL_COUNT).map(({ id, label, icon: Icon }, idx) => {
            const isActive = view === id && editingCourseId === undefined;
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setView(id as AdminView); setEditingCourseId(undefined); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 group
                  ${isActive
                    ? 'bg-violet-500/15 text-violet-400 shadow-inner'
                    : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-violet-400' : 'text-lms-text-muted group-hover:text-lms-text-primary transition-colors'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-violet-400" />}
              </motion.button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-lms-border">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-lms-text-muted">Sistema</p>
            {NAV.slice(PRINCIPAL_COUNT).map(({ id, label, icon: Icon }, idx) => {
              const isActive = view === id;
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx + PRINCIPAL_COUNT) * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setView(id as AdminView); setEditingCourseId(undefined); setSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 group
                    ${isActive
                      ? 'bg-violet-500/15 text-violet-400'
                      : 'text-lms-text-muted hover:bg-lms-hover hover:text-lms-text-primary'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-violet-400' : 'text-lms-text-muted group-hover:text-lms-text-primary transition-colors'} />
                  {label}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* User footer */}
        <div className="shrink-0 px-4 py-4 border-t border-lms-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-lms-text-primary truncate">{user?.email}</p>
              <p className="text-[10px] text-violet-400 font-semibold">Administrador</p>
            </div>
            <button
              onClick={signOut}
              title="Cerrar sesión"
              className="text-lms-text-muted hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 h-16 bg-lms-surface border-b border-lms-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-lms-text-muted hover:text-lms-text-primary">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-sm font-bold text-lms-text-primary">
              {editingCourseId !== undefined
                ? (editingCourseId ? 'Editar Curso' : 'Nuevo Curso')
                : NAV.find(n => n.id === view)?.label ?? 'Dashboard'}
            </h2>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
