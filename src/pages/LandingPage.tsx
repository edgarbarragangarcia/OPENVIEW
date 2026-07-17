import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LMSHero } from '../components/LMSHero';
import { CourseGrid } from '../components/CourseGrid';
import { FeaturesLMS } from '../components/FeaturesLMS';
import { CategoriesSection, ProcessSection, TestimonialsSection, FinalCTA } from '../components/AcademiaSections';
import { AuthModal } from '../components/AuthModal';
import { ScrollProgressBar } from '../components/effects/ScrollProgressBar';
import { CursorSpotlight } from '../components/effects/CursorSpotlight';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const openAuth = () => setIsAuthModalOpen(true);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full overflow-x-hidden bg-white text-slate-900 font-body antialiased selection:bg-primary/20 bg-grain">
      <ScrollProgressBar />
      <CursorSpotlight />
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
