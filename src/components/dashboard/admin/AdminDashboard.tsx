import { useState } from 'react';
import { LayoutDashboard, BookOpen, Users, Settings } from 'lucide-react';
import { Sidebar, SidebarItem } from '../shared/Sidebar';
import { DashboardHeader } from '../shared/DashboardHeader';
import { Overview } from './views/Overview';
import { CoursesManager } from './views/CoursesManager';
import { CourseForm } from './views/CourseForm';
import { StudentsView } from './views/StudentsView';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
  { id: 'courses', label: 'Cursos', icon: <BookOpen size={20} /> },
  { id: 'students', label: 'Estudiantes', icon: <Users size={20} /> },
  { id: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
];

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // States para manejar la navegación interna (ej: al editar un curso)
  const [editingCourseId, setEditingCourseId] = useState<string | undefined>();

  const handleNavigate = (id: string) => {
    setActiveView(id);
    if (id === 'courses') setEditingCourseId(undefined);
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <Overview />;
      case 'students': return <StudentsView />;
      case 'courses': 
        if (editingCourseId !== undefined) {
          return <CourseForm courseId={editingCourseId === 'new' ? undefined : editingCourseId} onBack={() => setEditingCourseId(undefined)} />;
        }
        return <CoursesManager onEdit={(id) => setEditingCourseId(id || 'new')} />;
      case 'settings': 
        return <div className="p-8 text-slate-500">Configuración (Próximamente)</div>;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        items={NAV_ITEMS}
        activeId={activeView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
