import { useState } from 'react';
import { BookOpen, Compass, User } from 'lucide-react';
import { Sidebar, SidebarItem } from '../shared/Sidebar';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MyCourses } from './views/MyCourses';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';
import { LessonViewer } from './views/LessonViewer';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'my-courses', label: 'Mis Cursos', icon: <BookOpen size={20} /> },
  { id: 'explore', label: 'Explorar', icon: <Compass size={20} /> },
  { id: 'profile', label: 'Mi Perfil', icon: <User size={20} /> },
];

export function StudentDashboard() {
  const [activeView, setActiveView] = useState('my-courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);

  const handleNavigate = (id: string) => {
    setActiveView(id);
    setViewingCourseId(null);
  };

  const renderView = () => {
    if (viewingCourseId) {
      return <LessonViewer courseId={viewingCourseId} onBack={() => setViewingCourseId(null)} />;
    }

    switch (activeView) {
      case 'my-courses': return <MyCourses onCourseSelect={setViewingCourseId} />;
      case 'explore': return <Explore />;
      case 'profile': return <Profile />;
      default: return <MyCourses onCourseSelect={setViewingCourseId} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {!viewingCourseId && (
        <Sidebar 
          items={NAV_ITEMS}
          activeId={activeView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!viewingCourseId && (
          <DashboardHeader 
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        )}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
