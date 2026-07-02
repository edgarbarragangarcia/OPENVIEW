import { motion } from 'motion/react';
import { PlayCircle } from 'lucide-react';

export function LMSHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 z-10 overflow-hidden bg-white text-slate-900">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full grid md:grid-cols-2 gap-10">
        <div className="space-y-10">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl sm:text-8xl font-serif text-slate-900 leading-[1.05]"
          >
            Liderazgo en <br />
            <span className="text-primary italic">IA Empresarial</span>
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
            <button className="bg-primary text-white px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-slate-900 transition-colors duration-300">
              Explorar Rutas
            </button>
            
            <button className="flex items-center gap-3 text-slate-700 font-semibold hover:text-primary transition-colors py-4">
              <PlayCircle className="h-8 w-8" strokeWidth={1.5} />
              <span className="uppercase tracking-widest text-xs">Conoce el Método</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
