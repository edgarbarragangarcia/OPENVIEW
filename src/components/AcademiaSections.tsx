import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, ClipboardCheck, PlayCircle, Users, Award, ChevronRight } from 'lucide-react';
import { getCategoriesWithCounts, type Category } from '../lib/courses';
import { RevealHeading } from './effects/RevealHeading';

// ─── Escuelas / Categorías ───────────────────────────────────────────────────

const CATEGORY_DESC: Record<string, string> = {
  ia: 'Domina los modelos y herramientas de IA que están redefiniendo la industria.',
  liderazgo: 'Desarrolla las habilidades directivas para liderar equipos y proyectos de alto impacto.',
  tecnologia: 'Construye software robusto con las prácticas y herramientas que usan los mejores equipos.',
  negocios: 'Aprende a tomar decisiones de negocio con visión estratégica y datos reales.',
  marketing: 'Convierte audiencias en comunidades y comunidades en resultados medibles.',
};

interface CategoriesSectionProps {
  onSelectCategory: (categoryId: number) => void;
}

export function CategoriesSection({ onSelectCategory }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<(Category & { courseCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoriesWithCounts()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-10 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="max-w-2xl mb-16">
          <RevealHeading className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] leading-tight mb-4 tracking-tight">
            Escuelas de Open View
          </RevealHeading>
          <p className="text-[#6e6e73] text-lg sm:text-xl font-normal">
            Elige la escuela que impulsa tu carrera y explora todos sus cursos.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-56 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const desc = CATEGORY_DESC[cat.slug] ?? 'Explora los cursos de esta escuela.';
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="group text-left relative overflow-hidden rounded-3xl border border-black/5 bg-white p-8 transition-colors duration-300 hover:border-[#0071e3]/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#0071e3]">
                    {cat.courseCount} curso{cat.courseCount !== 1 ? 's' : ''}
                  </p>
                  <h3 className="font-semibold text-[#1d1d1f] text-2xl mb-3 tracking-tight">{cat.name}</h3>
                  <p className="text-[#6e6e73] font-normal text-sm leading-relaxed">{desc}</p>
                  <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#0071e3]">
                    Ver cursos <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Proceso ─────────────────────────────────────────────────────────────────

const steps = [
  { num: '01', title: 'Explora', desc: 'Descubre cursos y rutas de aprendizaje alineadas a tus objetivos profesionales.', icon: Compass },
  { num: '02', title: 'Inscríbete', desc: 'Únete con un clic y accede de inmediato a todo el contenido del curso.', icon: ClipboardCheck },
  { num: '03', title: 'Aprende', desc: 'Avanza a tu ritmo con lecciones, materiales descargables y feedback en cada tema.', icon: PlayCircle },
  { num: '04', title: 'Practica', desc: 'Aplica lo aprendido con ejercicios reales y el apoyo de la comunidad.', icon: Users },
  { num: '05', title: 'Certifícate', desc: 'Obtén tu certificado y comienza el siguiente paso de tu carrera profesional.', icon: Award },
];

export function ProcessSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <RevealHeading className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] leading-tight mb-4 tracking-tight">
            Tu camino como estudiante
          </RevealHeading>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                  <Icon size={26} className="text-[#0071e3]" />
                </div>
                <span className="font-semibold text-3xl tracking-tighter mb-2 text-[#1d1d1f]/20">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6e6e73] font-normal leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonios ─────────────────────────────────────────────────────────────

const testimonials = [
  { name: 'Laura Gómez', role: 'Estudiante · Ruta de IA', quote: 'En pocas semanas pasé de no saber nada de IA a implementar mis propios modelos. La calidad de los instructores es otro nivel.' },
  { name: 'Diego Martínez', role: 'Estudiante · Liderazgo', quote: 'Los cursos de liderazgo me dieron herramientas que apliqué de inmediato con mi equipo. Se nota la experiencia real detrás de cada clase.' },
  { name: 'Valentina Ríos', role: 'Estudiante · Marketing Digital', quote: 'La comunidad y el feedback constante hicieron toda la diferencia. Nunca me sentí sola aprendiendo.' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto">
        <RevealHeading className="text-center text-4xl sm:text-6xl font-semibold text-[#1d1d1f] leading-tight mb-20 tracking-tight">
          Lo que dicen nuestros estudiantes
        </RevealHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-black/5 bg-white p-8 flex flex-col"
            >
              <p className="text-[#1d1d1f] font-normal leading-relaxed mb-8 flex-1">
                "{t.quote}"
              </p>
              <div>
                <p className="text-[#1d1d1f] font-semibold text-sm">{t.name}</p>
                <p className="text-xs font-medium mt-0.5 text-[#0071e3]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA final ───────────────────────────────────────────────────────────────

interface FinalCTAProps {
  onCtaClick?: () => void;
}

export function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-10 bg-black overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(0,113,227,0.25) 0%, transparent 70%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <p className="text-sm font-semibold text-[#2997ff] mb-6">
          Empieza hoy
        </p>
        <h2 className="font-semibold text-white leading-[1.05] mb-6 tracking-tight" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
          Empieza a aprender.
        </h2>
        <p className="text-lg sm:text-xl text-[#86868b] font-normal leading-relaxed mb-10 max-w-xl mx-auto">
          Únete a miles de estudiantes que ya están construyendo su futuro profesional con nosotros.
        </p>
        <button
          onClick={onCtaClick}
          className="inline-flex h-11 items-center gap-1 rounded-full bg-[#0071e3] px-8 text-base font-normal text-white hover:bg-[#0077ed] transition-colors duration-200"
        >
          Crear cuenta gratis
        </button>
      </motion.div>
    </section>
  );
}
