import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useIsMobile } from '../lib/useIsMobile';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

interface LMSHeroProps {
  onCtaClick?: () => void;
}

export function LMSHero({ onCtaClick }: LMSHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  // Efecto "apertura de producto" de Apple: el titular se encoge y se
  // desvanece levemente a medida que uno hace scroll hacia la siguiente
  // sección, en vez de quedarse estático. Desactivado en móvil (scroll-jank).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 sm:pt-24 bg-black text-white overflow-hidden">
      {/* Ambient glow, muy sutil — nada de starfield ni parallax */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(0,113,227,0.25) 0%, transparent 70%)' }}
      />

      <motion.div style={{ scale, opacity }} className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight mb-6"
        >
          Aprende las habilidades<br className="hidden sm:block" /> que transforman carreras.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg sm:text-2xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed mb-10"
        >
          Domina IA, tecnología, liderazgo y negocios con instructores que viven la industria.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <button
            onClick={() => scrollToId('cursos')}
            className="flex h-11 items-center gap-1 rounded-full bg-[#0071e3] px-6 text-base font-normal text-white hover:bg-[#0077ed] transition-colors duration-200"
          >
            Explorar cursos
          </button>
          <button
            onClick={onCtaClick}
            className="flex items-center gap-1 text-base font-normal text-[#2997ff] hover:underline underline-offset-4"
          >
            Crear cuenta <ChevronRight size={16} />
          </button>
        </motion.div>
      </motion.div>

      {/* Fundido hacia la siguiente sección blanca */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 60%, #fff 100%)',
        }}
      />
    </section>
  );
}
