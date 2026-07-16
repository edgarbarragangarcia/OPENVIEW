import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { StudentDashboard } from './components/dashboard/student/StudentDashboard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LMSHero } from './components/LMSHero';
import { CourseGrid } from './components/CourseGrid';
import { FeaturesLMS } from './components/FeaturesLMS';
import { CategoriesSection, ProcessSection, TestimonialsSection, FinalCTA } from './components/AcademiaSections';
import { AuthModal } from './components/AuthModal';

function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const openAuth = () => setIsAuthModalOpen(true);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full overflow-x-hidden bg-white text-slate-900 font-body antialiased selection:bg-primary/20">
      <Header onLoginClick={openAuth} />
      <main className="relative">
        <LMSHero onCtaClick={openAuth} />
        <FeaturesLMS />
        <CategoriesSection onSelectCategory={handleSelectCategory} />
        <CourseGrid selectedCategoryId={selectedCategoryId} onClearFilter={() => setSelectedCategoryId(null)} />
        <ProcessSection />
        <TestimonialsSection />
        <FinalCTA onCtaClick={openAuth} />
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
