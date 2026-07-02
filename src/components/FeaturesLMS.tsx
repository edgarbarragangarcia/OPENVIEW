import { motion } from 'motion/react';

const FEATURES = [
  {
    number: '01',
    title: 'Automatización Estratégica',
    description: 'Aprende a integrar soluciones de IA que reducen costos y optimizan procesos clave.',
  },
  {
    number: '02',
    title: 'Análisis Predictivo',
    description: 'Toma decisiones basadas en datos estructurados y modelos de Machine Learning avanzados.',
  },
  {
    number: '03',
    title: 'Liderazgo Digital',
    description: 'Desarrolla las habilidades directivas necesarias para liderar equipos en la era de la IA.',
  },
  {
    number: '04',
    title: 'Innovación Práctica',
    description: 'Proyectos reales en donde aplicarás modelos LLM y herramientas generativas a tu negocio.',
  }
];

export function FeaturesLMS() {
  return (
    <section className="py-32 px-6 sm:px-10 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 mb-24">
          <div className="md:w-1/2">
            <h2 className="text-4xl sm:text-6xl font-serif text-white mb-6 leading-tight">
              Nuestra <br />
              <span className="text-primary italic">Metodología</span>
            </h2>
          </div>
          <div className="md:w-1/2 flex items-center">
            <p className="text-white/70 text-lg leading-relaxed font-light">
              Creemos en una formación integral donde la estrategia de negocios se encuentra con la tecnología de vanguardia. 
              Nuestros programas están diseñados para empujar los límites operativos de tu empresa y prepararte 
              para el futuro del mercado corporativo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative"
            >
              <div className="text-5xl font-serif font-bold text-white/10 mb-6 group-hover:text-primary transition-colors duration-500">
                {feature.number}
              </div>
              <h3 className="text-2xl font-serif text-white mb-4">{feature.title}</h3>
              <div className="w-12 h-[1px] bg-primary mb-6"></div>
              <p className="text-white/60 text-sm leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
