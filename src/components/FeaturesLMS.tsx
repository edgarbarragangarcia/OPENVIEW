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
  },
  {
    number: '02',
    title: 'Aprendizaje con IA',
    description: 'Rutas personalizadas y asistencia inteligente que se adaptan a tu ritmo y tus objetivos.',
    colSpan: 'md:col-span-1',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Comunidad Activa',
    description: 'Conecta con otros estudiantes, comparte proyectos y crece acompañado en cada curso.',
    colSpan: 'md:col-span-1',
    icon: Users,
  },
  {
    number: '04',
    title: 'Certificaciones',
    description: 'Valida tus habilidades con certificados que abren puertas en el mercado laboral.',
    colSpan: 'md:col-span-2',
    icon: Award,
  }
];

export function FeaturesLMS() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16">
          <RevealHeading className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] mb-6 leading-tight tracking-tight">
            Nuestra metodología
          </RevealHeading>
          <p className="text-[#6e6e73] text-lg sm:text-xl leading-relaxed font-normal">
            Creemos en una formación práctica donde cada curso se construye junto a expertos que ya viven la industria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl p-10 bg-[#f5f5f7] transition-colors duration-300 hover:bg-[#eeeef1] ${feature.colSpan}`}
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <h3 className="mb-3 text-2xl font-semibold text-[#1d1d1f] tracking-tight">{feature.title}</h3>
              <p className="text-base leading-relaxed text-[#6e6e73]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
