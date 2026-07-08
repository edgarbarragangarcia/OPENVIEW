import { motion } from 'motion/react';

const FEATURES = [
  {
    number: '01',
    title: 'Instructores Expertos',
    description: 'Aprende de profesionales activos en la industria, con experiencia real aplicable desde el primer día.',
    colSpan: 'md:col-span-2'
  },
  {
    number: '02',
    title: 'Aprendizaje con IA',
    description: 'Rutas personalizadas y asistencia inteligente que se adaptan a tu ritmo y tus objetivos.',
    colSpan: 'md:col-span-1'
  },
  {
    number: '03',
    title: 'Comunidad Activa',
    description: 'Conecta con otros estudiantes, comparte proyectos y crece acompañado en cada curso.',
    colSpan: 'md:col-span-1'
  },
  {
    number: '04',
    title: 'Certificaciones',
    description: 'Valida tus habilidades con certificados que abren puertas en el mercado laboral.',
    colSpan: 'md:col-span-2'
  }
];

export function FeaturesLMS() {
  return (
    <section className="py-32 px-6 sm:px-10 bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-transparent via-primary-light/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-16 mb-24">
          <div className="md:w-1/2">
            <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Nuestra <br />
              <span className="text-gradient italic font-black">Metodología</span>
            </h2>
          </div>
          <div className="md:w-1/2 flex items-center">
            <p className="text-slate-600 text-lg leading-relaxed font-light">
              Creemos en una formación práctica donde cada curso se construye junto a expertos que ya viven la industria.
              Nuestros programas están diseñados para que domines habilidades reales y las apliques
              desde la primera semana.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] card-glow card-glow-brand gradient-border transition-all duration-500 overflow-hidden ${feature.colSpan}`}
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light/0 to-primary-light/0 group-hover:from-primary-light/5 group-hover:to-transparent transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="text-5xl font-serif font-black text-slate-100 mb-8 group-hover:text-primary-light transition-colors duration-500">
                  {feature.number}
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mb-4 font-bold">{feature.title}</h3>
                <div className="w-12 h-1 rounded-full bg-slate-200 mb-6 group-hover:bg-primary transition-colors duration-500"></div>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
