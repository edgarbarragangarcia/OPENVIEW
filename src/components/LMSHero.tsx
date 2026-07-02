import { motion } from 'motion/react';
import { PlayCircle } from 'lucide-react';

export function LMSHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 z-10 overflow-hidden bg-white text-slate-900">
      {/* Background blurred orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full grid md:grid-cols-2 gap-10">
        <div className="space-y-10">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl sm:text-8xl font-serif text-slate-900 leading-[1.05]"
          >
            Liderazgo en <br />
            <span className="text-gradient italic font-black">IA Empresarial</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-2xl text-slate-600 max-w-lg font-light leading-relaxed"
          >
            Transforma tu organización. Domina las herramientas de Inteligencia Artificial y lidera la revolución digital con expertos de la industria.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6"
          >
            <button className="relative overflow-hidden group bg-gradient-primary text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.5)] transition-all duration-300 hover:scale-105">
              <span className="relative z-10">Explorar Rutas</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            </button>
            
            <button className="group flex items-center gap-3 text-slate-700 font-semibold hover:text-primary transition-colors py-4">
              <div className="bg-slate-50 p-3 rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:bg-primary/10">
                <PlayCircle className="h-6 w-6 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
              <span className="uppercase tracking-widest text-xs">Conoce el Método</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
