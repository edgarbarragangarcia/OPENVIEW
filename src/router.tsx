import { lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';

const AdminDashboard = lazy(() =>
  import('./components/dashboard/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const StudentDashboard = lazy(() =>
  import('./components/dashboard/student/StudentDashboard').then(m => ({ default: m.StudentDashboard }))
);
const ForceChangePassword = lazy(() =>
  import('./components/ForceChangePassword').then(m => ({ default: m.ForceChangePassword }))
);
const LandingPage = lazy(() => import('./pages/LandingPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );
}

export function AppRouter() {
  const { user, role, isLoading, mustChangePassword } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {(() => {
        // Si no hay sesión, mostrar Landing
        if (!user) {
          return <LandingPage />;
        }

        if (mustChangePassword) {
          return <ForceChangePassword />;
        }

        // Si hay sesión, enrutar por rol
        if (role === 'admin') {
          return <AdminDashboard />;
        }

        // Por defecto, interfaz de estudiante
        return <StudentDashboard />;
      })()}
    </Suspense>
  );
}
