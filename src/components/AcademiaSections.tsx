import { motion } from 'motion/react';
import { Compass, ClipboardCheck, PlayCircle, Users, Award, ArrowRight } from 'lucide-react';

// ─── Rutas de Aprendizaje ────────────────────────────────────────────────────

const learningPaths = [
  { name: 'Inteligencia Artificial', tags: 'IA · Automatización · Datos', color: '#0d59f2', desc: 'Domina los modelos y herramientas de IA que están redefiniendo la industria.' },
  { name: 'Liderazgo', tags: 'Gestión · Equipos · Estrategia', color: '#10b981', desc: 'Desarrolla las habilidades directivas para liderar equipos y proyectos de alto impacto.' },
  { name: 'Tecnología', tags: 'Desarrollo · Cloud · Producto', color: '#6366f1', desc: 'Construye software robusto con las prácticas y herramientas que usan los mejores equipos.' },
  { name: 'Negocios', tags: 'Finanzas · Operaciones · Ventas', color: '#f59e0b', desc: 'Aprende a tomar decisiones de negocio con visión estratégica y datos reales.' },
  { name: 'Marketing Digital', tags: 'Growth · Contenido · Analítica', color: '#ec4899', desc: 'Convierte audiencias en comunidades y comunidades en resultados medibles.' },
];

export function LearningPathsSection() {
  return (
    <section className="py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 leading-tight">
            Rutas de <br />
            <span className="text-gradient italic font-black">Aprendizaje</span>
          </h2>
          <p className="text-slate-500 text-lg font-light max-w-md">
            Elige el camino que impulsa tu carrera y avanza curso a curso con un plan claro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8 sm:p-10 card-glow card-glow-brand ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              <div
                className="absolute -top-1/2 -left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
                style={{ background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`, filter: 'blur(60px)' }}
              />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: p.color }}>
                  {p.tags}
                </p>
                <h3 className="font-serif font-black text-slate-900 text-2xl sm:text-3xl mb-3">
                  {p.name}
                </h3>
                <p className="text-slate-500 font-light leading-relaxed max-w-xl">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
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
    <section className="py-32 px-6 sm:px-10 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 leading-tight mb-4">
            Tu camino <span className="text-gradient italic font-black">como estudiante</span>
          </h2>
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
        <h2 className="text-center text-4xl sm:text-6xl font-serif text-slate-900 leading-tight mb-20">
          Lo que dicen <span className="text-gradient italic font-black">nuestros estudiantes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
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
        <button
          onClick={onCtaClick}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-10 text-base font-bold text-white shadow-[0_0_40px_rgba(13,89,242,0.4)] hover:shadow-[0_0_60px_rgba(13,89,242,0.6)] hover:-translate-y-0.5 transition-all duration-300"
        >
          Crear cuenta gratis <ArrowRight size={18} />
        </button>
      </motion.div>
    </section>
  );
}
