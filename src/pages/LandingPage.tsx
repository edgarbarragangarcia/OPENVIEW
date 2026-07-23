import { useState } from 'react';
import { Header, type LandingView } from '../components/Header';
import { Footer } from '../components/Footer';
import { LMSHero } from '../components/LMSHero';
import { CourseGrid } from '../components/CourseGrid';
import { FeaturesLMS } from '../components/FeaturesLMS';
import { CategoriesSection, ProcessSection, TestimonialsSection, FinalCTA } from '../components/AcademiaSections';
import { ConsultingBanner, ConsultingHero, ConsultingServicesSection, MethodologySection, CaseStudiesSection, ConsultingCTA } from '../components/ConsultingSections';
import { AuthModal } from '../components/AuthModal';
import { ScrollProgressBar } from '../components/effects/ScrollProgressBar';
import { CursorSpotlight } from '../components/effects/CursorSpotlight';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [view, setView] = useState<LandingView>('home');
  const openAuth = () => setIsAuthModalOpen(true);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigateView = (nextView: LandingView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="apple-landing relative w-full overflow-x-hidden bg-white text-[#1d1d1f] font-body antialiased selection:bg-[#0071e3]/20">
      <ScrollProgressBar />
      <CursorSpotlight />
      <Header onLoginClick={openAuth} activeView={view} onNavigateView={handleNavigateView} />
      <main className="relative">
        {view === 'home' ? (
          <>
            <LMSHero onCtaClick={openAuth} />
            <FeaturesLMS />
            <ConsultingBanner onViewServices={() => handleNavigateView('consultoria')} />
            <CategoriesSection onSelectCategory={handleSelectCategory} />
            <CourseGrid selectedCategoryId={selectedCategoryId} onClearFilter={() => setSelectedCategoryId(null)} />
            <ProcessSection />
            <TestimonialsSection />
            <FinalCTA onCtaClick={openAuth} />
          </>
        ) : (
          <>
            <ConsultingHero onCtaClick={openAuth} />
            <ConsultingServicesSection />
            <MethodologySection />
            <CaseStudiesSection />
            <ConsultingCTA onCtaClick={openAuth} />
          </>
        )}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
