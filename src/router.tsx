import { lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { PasskeyPrompt } from './components/PasskeyPrompt';

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
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070f]">
      <div className="w-8 h-8 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
    </div>
  );
}

export function AppRouter() {
  const { user, role, isLoading, mustChangePassword } = useAuth();

  // Página pública de verificación de certificados: no requiere sesión ni
  // espera a que termine de cargar el estado de auth.
  if (window.location.pathname === '/verificar') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <VerifyCertificate />
      </Suspense>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Fuera del switch de rutas: al iniciar sesión se cambia de vista y
          cualquier cosa montada dentro de la anterior se desmonta. */}
      <PasskeyPrompt />
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
