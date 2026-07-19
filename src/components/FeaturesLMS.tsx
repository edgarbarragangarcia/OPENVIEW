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
    accent: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #0891b2 100%)'
  },
  {
    number: '02',
    title: 'Aprendizaje con IA',
    description: 'Rutas personalizadas y asistencia inteligente que se adaptan a tu ritmo y tus objetivos.',
    colSpan: 'md:col-span-1',
    icon: Sparkles,
    accent: '#7c3aed',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 45%, #c026d3 100%)'
  },
  {
    number: '03',
    title: 'Comunidad Activa',
    description: 'Conecta con otros estudiantes, comparte proyectos y crece acompañado en cada curso.',
    colSpan: 'md:col-span-1',
    icon: Users,
    accent: '#0d9488',
    gradient: 'linear-gradient(135deg, #0e7490 0%, #0d9488 50%, #059669 100%)'
  },
  {
    number: '04',
    title: 'Certificaciones',
    description: 'Valida tus habilidades con certificados que abren puertas en el mercado laboral.',
    colSpan: 'md:col-span-2',
    icon: Award,
    accent: '#e11d48',
    gradient: 'linear-gradient(135deg, #be123c 0%, #e11d48 45%, #f97316 100%)'
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
              style={{
                '--accent': feature.accent,
                backgroundImage: feature.gradient
              } as CSSProperties}
              className={`group relative flex flex-col overflow-hidden rounded-3xl p-10 text-white shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--accent)_55%,transparent)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-20px_color-mix(in_srgb,var(--accent)_70%,transparent)] ${feature.colSpan}`}
            >
              {/* Brillo superior que da volumen al degradado */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
              />
              {/* Borde interior claro, para que el color no se vea plano */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
                    <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-serif text-5xl font-black leading-none text-white/35 transition-colors duration-500 group-hover:text-white/55">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mb-4 font-serif text-2xl font-bold text-white">{feature.title}</h3>
                <div className="mb-6 h-1 w-12 rounded-full bg-white/60 transition-all duration-500 group-hover:w-20" />
                <p className="text-sm leading-relaxed text-white/90">
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
