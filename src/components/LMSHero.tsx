import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { MagneticButton } from './effects/MagneticButton';
import { AnimatedCounter } from './effects/AnimatedCounter';

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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-12 sm:pt-20 sm:pb-0 z-10 overflow-hidden bg-white text-slate-900">

      {/* Background orbs (autoplay drift + scroll parallax) */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-1/4 w-[800px] h-[800px] bg-sky-400/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -60, 40, 0], y: [0, 50, -40, 0], scale: [1, 0.8, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 70, -30, 0], y: [0, 40, -60, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px]"
        />
      </motion.div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(to right, #0ea5e9 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div style={{ opacity: contentFade }} className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 w-full text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sticker inline-flex items-center gap-1.5 sm:gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 shadow-sm"
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500 shrink-0" />
          Open View Academia · 2026
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={wordContainer}
          style={{ perspective: 800 }}
          className="text-4xl sm:text-6xl lg:text-8xl font-serif font-black leading-[1.05] sm:leading-[1.0] tracking-tight text-slate-900 mb-6"
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
          className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0"
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

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 border-t border-slate-100 pt-10"
        >
          {[
            { value: '+2,000', label: 'Estudiantes activos' },
            { value: '+120', label: 'Cursos disponibles' },
            { value: '98%', label: 'Satisfacción' },
            { value: '+50', label: 'Empresas certificadas' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter
                value={stat.value}
                className="text-gradient block text-3xl sm:text-4xl font-black font-serif"
              />
              <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
