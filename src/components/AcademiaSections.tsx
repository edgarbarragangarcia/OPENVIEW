import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, ClipboardCheck, PlayCircle, Users, Award, ArrowRight } from 'lucide-react';
import { getCategoriesWithCounts, type Category } from '../lib/courses';
import { MagneticButton } from './effects/MagneticButton';
import { RevealHeading } from './effects/RevealHeading';

// ─── Escuelas / Categorías (estilo grid de "schools" de Platzi) ─────────────

const CATEGORY_META: Record<string, { color: string; desc: string }> = {
  ia: { color: '#0d59f2', desc: 'Domina los modelos y herramientas de IA que están redefiniendo la industria.' },
  liderazgo: { color: '#10b981', desc: 'Desarrolla las habilidades directivas para liderar equipos y proyectos de alto impacto.' },
  tecnologia: { color: '#6366f1', desc: 'Construye software robusto con las prácticas y herramientas que usan los mejores equipos.' },
  negocios: { color: '#f59e0b', desc: 'Aprende a tomar decisiones de negocio con visión estratégica y datos reales.' },
  marketing: { color: '#ec4899', desc: 'Convierte audiencias en comunidades y comunidades en resultados medibles.' },
};
const FALLBACK_COLORS = ['#0d59f2', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#0891b2', '#7c3aed'];

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
    <section className="relative py-32 px-6 sm:px-10 overflow-hidden" style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #fdf2f8 45%, #ecfeff 100%)' }}>
      <div
        className="absolute top-0 left-0 w-2/3 h-[700px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(13,89,242,0.16), transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-2/3 h-[700px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 100%, rgba(236,72,153,0.14), transparent 70%)' }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-2xl mb-16">
          <RevealHeading className="text-4xl sm:text-6xl font-serif text-slate-900 leading-tight mb-4">
            Escuelas de <br />
            <span className="text-gradient italic font-black">Open View</span>
          </RevealHeading>
          <p className="text-slate-500 text-lg font-light">
            Elige la escuela que impulsa tu carrera y explora todos sus cursos.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-56 bg-slate-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const meta = CATEGORY_META[cat.slug] ?? { color: FALLBACK_COLORS[i % FALLBACK_COLORS.length], desc: 'Explora los cursos de esta escuela.' };
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover={{ rotate: i % 2 === 0 ? -1 : 1, scale: 1.02 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="group text-left relative overflow-hidden rounded-3xl border p-8 card-glow card-glow-brand transition-colors duration-300"
                  style={{ background: `linear-gradient(135deg, ${meta.color}1c, ${meta.color}08)`, borderColor: `${meta.color}35` }}
                >
                  <div
                    className="absolute -top-1/3 -right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.18] group-hover:opacity-[0.28] transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`, filter: 'blur(50px)' }}
                  />
                  <div className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: meta.color }}>
                      {cat.courseCount} curso{cat.courseCount !== 1 ? 's' : ''}
                    </p>
                    <h3 className="font-serif font-black text-slate-900 text-2xl mb-3">{cat.name}</h3>
                    <p className="text-slate-500 font-light text-sm leading-relaxed">{meta.desc}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      Ver cursos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
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
  { num: '01', title: 'Explora', desc: 'Descubre cursos y rutas de aprendizaje alineadas a tus objetivos profesionales.', icon: Compass, color: '#0d59f2' },
  { num: '02', title: 'Inscríbete', desc: 'Únete con un clic y accede de inmediato a todo el contenido del curso.', icon: ClipboardCheck, color: '#6366f1' },
  { num: '03', title: 'Aprende', desc: 'Avanza a tu ritmo con lecciones, materiales descargables y feedback en cada tema.', icon: PlayCircle, color: '#ec4899' },
  { num: '04', title: 'Practica', desc: 'Aplica lo aprendido con ejercicios reales y el apoyo de la comunidad.', icon: Users, color: '#10b981' },
  { num: '05', title: 'Certifícate', desc: 'Obtén tu certificado y comienza el siguiente paso de tu carrera profesional.', icon: Award, color: '#f59e0b' },
];

export function ProcessSection() {
  return (
    <section className="relative py-32 px-6 sm:px-10 bg-slate-50 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-1/2 h-[500px] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgba(236,72,153,0.05), transparent 70%)' }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <RevealHeading className="text-4xl sm:text-6xl font-serif text-slate-900 leading-tight mb-4">
            Tu camino <span className="text-gradient italic font-black">como estudiante</span>
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
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                >
                  <Icon size={26} style={{ color: step.color }} />
                </div>
                <span className="font-serif font-black text-3xl tracking-tighter mb-2" style={{ color: `${step.color}80` }}>
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 font-light leading-relaxed">{step.desc}</p>
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
  { name: 'Laura Gómez', role: 'Estudiante · Ruta de IA', quote: 'En pocas semanas pasé de no saber nada de IA a implementar mis propios modelos. La calidad de los instructores es otro nivel.', color: '#0d59f2' },
  { name: 'Diego Martínez', role: 'Estudiante · Liderazgo', quote: 'Los cursos de liderazgo me dieron herramientas que apliqué de inmediato con mi equipo. Se nota la experiencia real detrás de cada clase.', color: '#10b981' },
  { name: 'Valentina Ríos', role: 'Estudiante · Marketing Digital', quote: 'La comunidad y el feedback constante hicieron toda la diferencia. Nunca me sentí sola aprendiendo.', color: '#6366f1' },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <RevealHeading className="text-center text-4xl sm:text-6xl font-serif text-slate-900 leading-tight mb-20">
          Lo que dicen <span className="text-gradient italic font-black">nuestros estudiantes</span>
        </RevealHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              whileHover={{ y: -4, rotate: i % 2 === 0 ? -0.75 : 0.75 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-8 flex flex-col card-glow"
            >
              <p className="text-slate-700 font-light italic leading-relaxed mb-8 flex-1">
                "{t.quote}"
              </p>
              <div>
                <p className="text-slate-900 font-bold text-sm">{t.name}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: t.color }}>{t.role}</p>
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
    <section className="relative py-32 px-6 sm:px-10 bg-slate-900 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(13,89,242,0.35) 0%, transparent 70%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-sky-400 mb-6">
          Empieza hoy
        </p>
        <h2 className="font-serif font-black text-white leading-[1.05] mb-6" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
          Empieza a <span className="italic" style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>aprender.</span>
        </h2>
        <p className="text-lg text-slate-300 font-light leading-relaxed mb-10 max-w-xl mx-auto">
          Únete a miles de estudiantes que ya están construyendo su futuro profesional con nosotros.
        </p>
        <MagneticButton
          onClick={onCtaClick}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-10 text-base font-bold text-white shadow-[0_0_40px_rgba(13,89,242,0.4)] hover:shadow-[0_0_60px_rgba(13,89,242,0.6)] transition-shadow duration-300"
        >
          Crear cuenta gratis <ArrowRight size={18} />
        </MagneticButton>
      </motion.div>
    </section>
  );
}
