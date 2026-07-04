import { motion } from 'motion/react';
import { PlayCircle, Sparkles, ArrowRight } from 'lucide-react';

export function LMSHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 z-10 overflow-hidden bg-white text-slate-900">

      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-sky-100/80 via-indigo-100/40 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-sky-200/30 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none -z-10" />

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
          Open View Academy · 2026
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-serif font-black leading-[1.0] tracking-tight text-slate-900 mb-6"
        >
          Liderazgo en{' '}
          <span
            className="italic"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #0ea5e9 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            IA Empresarial
          </span>
        </motion.h1>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-24 h-1 rounded-full mx-auto mb-8"
          style={{ background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed mb-12"
        >
          Transforma tu organización. Domina las herramientas de Inteligencia Artificial
          y lidera la revolución digital con expertos de la industria.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            className="group relative overflow-hidden flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_4px_24px_rgba(14,165,233,0.35)] hover:shadow-[0_8px_36px_rgba(14,165,233,0.5)] transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <span className="relative z-10">Explorar Rutas</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>

          <button className="group flex items-center gap-3 text-slate-600 font-semibold hover:text-sky-500 transition-colors px-6 py-4">
            <div className="bg-slate-100 p-3 rounded-full shadow-sm group-hover:shadow-md group-hover:bg-sky-50 transition-all">
              <PlayCircle className="h-5 w-5 group-hover:text-sky-500 transition-colors" strokeWidth={1.5} />
            </div>
            <span className="uppercase tracking-widest text-xs">Conoce el Método</span>
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 border-t border-slate-100 pt-10"
        >
          {[
            { value: '+2,000', label: 'Profesionales formados' },
            { value: '98%', label: 'Satisfacción' },
            { value: '+50', label: 'Empresas certificadas' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-4xl font-black font-serif"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-slate-400 uppercase tracking-widest mt-1 font-medium">{stat.label}</p>
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
