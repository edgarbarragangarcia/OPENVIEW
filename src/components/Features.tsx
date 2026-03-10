import { motion } from 'motion/react';
import { SphericalCarousel } from './SphericalCarousel';

export function Features() {
  return (
    <section id="servicios" className="py-24 overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-black uppercase tracking-[0.2em] text-primary"
          >
            Servicios
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Nuestras Especialidades
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-light leading-relaxed text-slate-400"
          >
            Elevamos el estándar del software en Latinoamérica a través de ingeniería impecable y diseño de primer nivel.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 flex justify-center">
          <SphericalCarousel />
        </div>
      </div>
    </section>
  );
}
