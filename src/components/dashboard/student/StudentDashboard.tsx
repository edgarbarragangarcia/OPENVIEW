import { useState } from 'react';
import { BookOpen, Compass, User } from 'lucide-react';
import { Sidebar, SidebarItem } from '../shared/Sidebar';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MyCourses } from './views/MyCourses';
import { Explore } from './views/Explore';
import { Profile } from './views/Profile';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'my-courses', label: 'Mis Cursos', icon: <BookOpen size={20} /> },
  { id: 'explore', label: 'Explorar', icon: <Compass size={20} /> },
  { id: 'profile', label: 'Mi Perfil', icon: <User size={20} /> },
];

export function StudentDashboard() {
  const [activeView, setActiveView] = useState('my-courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'my-courses': return <MyCourses />;
      case 'explore': return <Explore />;
      case 'profile': return <Profile />;
      default: return <MyCourses />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        items={NAV_ITEMS}
        activeId={activeView}
        onNavigate={setActiveView}
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
