import { useAuth } from './contexts/AuthContext';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { StudentDashboard } from './components/dashboard/student/StudentDashboard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LMSHero } from './components/LMSHero';
import { CourseGrid } from './components/CourseGrid';
import { FeaturesLMS } from './components/FeaturesLMS';

function LandingPage() {
  return (
    <div className="relative w-full overflow-x-hidden bg-white text-slate-900 font-body antialiased selection:bg-primary/20">
      <Header />
      <main>
        <LMSHero />
        <FeaturesLMS />
        <CourseGrid />
      </main>
      <Footer />
    </div>
  );
}

export function AppRouter() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no hay sesión, mostrar Landing
  if (!user) {
    return <LandingPage />;
  }

  // Si hay sesión, enrutar por rol
  if (role === 'admin') {
    return <AdminDashboard />;
  }

  // Por defecto, interfaz de estudiante
  return <StudentDashboard />;
}
