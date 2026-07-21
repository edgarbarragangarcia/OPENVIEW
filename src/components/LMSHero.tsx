import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { MagneticButton } from './effects/MagneticButton';
import { StarfieldBackground } from './effects/StarfieldBackground';
import { useIsMobile } from '../lib/useIsMobile';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const HEADLINE_WORDS = ['Aprende', 'las', 'habilidades'];

const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const wordItem = {
  hidden: { opacity: 0, y: 40, rotateX: 40 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

interface LMSHeroProps {
  onCtaClick?: () => void;
}

export function LMSHero({ onCtaClick }: LMSHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  // En móvil dejamos el parallax y el fundido en 0: mover/recomponer las capas
  // grandes con blur del starfield en cada frame de scroll causaba mucho tirón.
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : 160]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, isMobile ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center pt-36 pb-12 sm:pt-32 sm:pb-0 lg:pt-28 z-10 overflow-hidden bg-slate-900 text-white">

      {/* Milky Way starfield (with scroll parallax) */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 -z-10 pointer-events-none">
        <StarfieldBackground density={1.1} />
      </motion.div>

      {/* Ambient glow (matches FinalCTA dark section) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 -z-10"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(13,89,242,0.35) 0%, transparent 70%)' }}
      />

      <motion.div style={{ opacity: contentFade }} className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 w-full text-center">

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={wordContainer}
          style={{ perspective: 800 }}
          className="text-4xl sm:text-6xl lg:text-8xl font-serif font-black leading-[1.05] sm:leading-[1.0] tracking-tight text-white mb-6"
        >
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span key={i} variants={wordItem} className="inline-block mr-[0.25em]">
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={wordItem}
            className="italic inline-block"
            style={{
              background: 'var(--gradient-brand)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            que transforman carreras.
          </motion.span>
        </motion.h1>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-24 h-1 rounded-full mx-auto mb-8"
          style={{ background: 'var(--gradient-brand)' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0"
        >
          Domina IA, tecnología, liderazgo y negocios con instructores que viven la industria.
          Cursos prácticos, certificados reales, resultados desde la primera semana.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-16"
        >
          <MagneticButton
            onClick={() => scrollToId('cursos')}
            className="flex h-12 sm:h-14 items-center gap-2 rounded-full bg-primary px-6 sm:px-8 text-sm sm:text-base font-bold text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_45px_rgba(14,165,233,0.6)] transition-shadow duration-300"
          >
            Explorar cursos <ArrowRight size={18} />
          </MagneticButton>

        </motion.div>

      </motion.div>

      {/* Fundido hacia la sección clara siguiente, para que el borde del
          starfield no corte en seco contra el blanco. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-36 z-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(248,250,252,0) 0%, rgba(248,250,252,0.35) 45%, rgba(248,250,252,0.85) 78%, #f8fafc 100%)'
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
