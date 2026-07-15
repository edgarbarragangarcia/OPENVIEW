import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

interface LMSHeroProps {
  onCtaClick?: () => void;
}

export function LMSHero({ onCtaClick }: LMSHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 z-10 overflow-hidden bg-white text-slate-900">

      {/* Background orbs */}
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-1/4 w-[800px] h-[800px] bg-sky-400/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -40, 0], scale: [1, 0.8, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ x: [0, 70, -30, 0], y: [0, 40, -60, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(to right, #0ea5e9 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 w-full text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          Open View Academia · 2026
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-serif font-black leading-[1.0] tracking-tight text-slate-900 mb-6"
        >
          Aprende las habilidades{' '}
          <span
            className="italic"
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
          </span>
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
          className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed mb-10"
        >
          Domina IA, tecnología, liderazgo y negocios con instructores que viven la industria.
          Cursos prácticos, certificados reales, resultados desde la primera semana.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => scrollToId('cursos')}
            className="flex h-14 items-center gap-2 rounded-full bg-slate-900 px-8 text-base font-bold text-white shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.35)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Explorar cursos <ArrowRight size={18} />
          </button>

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
              <p
                className="text-3xl sm:text-4xl font-black font-serif"
                style={{
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
