import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Sparkles, Users, Award } from 'lucide-react';
import { RevealHeading } from './effects/RevealHeading';

const FEATURES = [
  {
    number: '01',
    title: 'Instructores Expertos',
    description: 'Aprende de profesionales activos en la industria, con experiencia real aplicable desde el primer día.',
    colSpan: 'md:col-span-2',
    icon: GraduationCap,
    accent: '#0d59f2'
  },
  {
    number: '02',
    title: 'Aprendizaje con IA',
    description: 'Rutas personalizadas y asistencia inteligente que se adaptan a tu ritmo y tus objetivos.',
    colSpan: 'md:col-span-1',
    icon: Sparkles,
    accent: '#6366f1'
  },
  {
    number: '03',
    title: 'Comunidad Activa',
    description: 'Conecta con otros estudiantes, comparte proyectos y crece acompañado en cada curso.',
    colSpan: 'md:col-span-1',
    icon: Users,
    accent: '#06b6d4'
  },
  {
    number: '04',
    title: 'Certificaciones',
    description: 'Valida tus habilidades con certificados que abren puertas en el mercado laboral.',
    colSpan: 'md:col-span-2',
    icon: Award,
    accent: '#0ea5e9'
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
            <RevealHeading className="text-4xl sm:text-6xl font-serif text-slate-900 mb-6 leading-tight">
              Nuestra <br />
              <span className="text-gradient italic font-black">Metodología</span>
            </RevealHeading>
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
              style={{ '--accent': feature.accent } as CSSProperties}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:shadow-[0_28px_60px_-20px_color-mix(in_srgb,var(--accent)_40%,transparent)] ${feature.colSpan}`}
            >
              {/* Lavado de color en hover, desde la esquina del ícono */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]"
                style={{ background: feature.accent }}
              />
              {/* Filete superior que se dibuja al pasar el cursor */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-8 flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-105"
                    style={{
                      borderColor: `${feature.accent}25`,
                      backgroundColor: `${feature.accent}0F`,
                      color: feature.accent
                    }}
                  >
                    <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-serif text-5xl font-black leading-none text-slate-100 transition-colors duration-500 group-hover:text-[color-mix(in_srgb,var(--accent)_28%,white)]">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mb-4 font-serif text-2xl font-bold text-slate-900">{feature.title}</h3>
                <div
                  className="mb-6 h-1 w-12 rounded-full transition-all duration-500 group-hover:w-20"
                  style={{ backgroundImage: `linear-gradient(90deg, ${feature.accent}, ${feature.accent}00)` }}
                />
                <p className="text-sm font-light leading-relaxed text-slate-500 transition-colors duration-500 group-hover:text-slate-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
