import { motion } from 'motion/react';
import { PlayCircle } from 'lucide-react';

export function LMSHero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 z-10 overflow-hidden bg-black text-white">
      {/* Dramatic Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
          alt="Tecnología y Futuro" 
          className="w-full h-full object-cover opacity-60 grayscale-[50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full grid md:grid-cols-2 gap-10">
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-xs tracking-[0.2em] uppercase font-semibold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-primary"></span>
            </span>
            Matrículas Abiertas 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl sm:text-8xl font-serif text-white leading-[1.05]"
          >
            Liderazgo en <br />
            <span className="text-primary italic">IA Empresarial</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-2xl text-white/80 max-w-lg font-light leading-relaxed"
          >
            Transforma tu organización. Domina las herramientas de Inteligencia Artificial y lidera la revolución digital con expertos de la industria.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6"
          >
            <button className="bg-primary text-white px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors duration-300">
              Explorar Rutas
            </button>
            
            <button className="flex items-center gap-3 text-white font-semibold hover:text-primary transition-colors py-4">
              <PlayCircle className="h-8 w-8" strokeWidth={1.5} />
              <span className="uppercase tracking-widest text-xs">Conoce el Método</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
