/**
 * ScrollStory — Full-page Apple/Dora-style scrollytelling experience.
 *
 * Architecture:
 *  Each "chapter" is a tall wrapper (e.g. h-[250vh]) with a sticky inner
 *  container (h-screen). As the user scrolls, useScroll detects how far
 *  through the chapter we are (0→1) and we drive all animations from that
 *  single progress value — exactly like Dora.run / Apple product pages.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import {
  GraduationCap, BrainCircuit, Users, Award,
  Compass, ClipboardCheck, PlayCircle,
  ArrowRight,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

/** A single word that brightens as scrollYProgress crosses its window. */
function Word({
  children, progress, start, end,
}: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const color = useTransform(progress, [start, end], ['#2a2a3a', '#ffffff']);
  const opacity = useTransform(progress, [start, start + (end - start) * 0.3, end], [0.18, 0.6, 1]);
  return (
    <motion.span style={{ color, opacity }} className="inline-block mr-[0.3em]">
      {children}
    </motion.span>
  );
}

function WordReveal({ text, progress, start, end, className = '' }: {
  text: string; progress: MotionValue<number>;
  start: number; end: number; className?: string;
}) {
  const words = text.split(' ');
  return (
    <p className={`flex flex-wrap ${className}`}>
      {words.map((w, i) => {
        const step = (end - start) / words.length;
        return (
          <Word key={i} progress={progress} start={start + step * i} end={start + step * (i + 1)}>
            {w}
          </Word>
        );
      })}
    </p>
  );
}

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

// ─── Chapter 0: HERO ────────────────────────────────────────────────────────

function ChapterHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const titleScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.18]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.55, 0.85], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.85], [0, -60]);

  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.55, 0.85], [0, 1, 1, 0]);
  const subtitleY = useTransform(scrollYProgress, [0.05, 0.4], [30, 0]);

  const btnsOpacity = useTransform(scrollYProgress, [0, 0.08, 0.55, 0.85], [0, 1, 1, 0]);

  // Big background text that scales dramatically
  const bgScale = useTransform(scrollYProgress, [0, 0.85], [1, 3]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.1, 0.55, 0.85], [0, 0.07, 0.07, 0]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Giant background brand text */}
        <motion.p
          className="absolute select-none text-white font-black whitespace-nowrap pointer-events-none"
          style={{
            fontSize: 'clamp(100px, 20vw, 280px)',
            letterSpacing: '-0.05em',
            scale: bgScale,
            opacity: bgOpacity,
          }}
        >
          Open View
        </motion.p>

        {/* Main title */}
        <motion.div
          className="relative z-10 text-center px-6"
          style={{ scale: titleScale, opacity: titleOpacity, y: titleY }}
        >
          <motion.h1
            className="font-black tracking-tighter text-white leading-[0.92]"
            style={{ fontSize: 'clamp(56px, 9vw, 130px)' }}
          >
            Open View<br />
            <span
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Academia.
            </span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="relative z-10 mt-8 text-xl md:text-2xl text-slate-300 font-light text-center max-w-xl px-6 leading-relaxed"
          style={{ opacity: subtitleOpacity, y: subtitleY }}
        >
          Domina las habilidades que transforman carreras: IA, tecnología, liderazgo y negocios — con instructores que viven la industria.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative z-10 mt-10 flex flex-col sm:flex-row gap-4 px-6"
          style={{ opacity: btnsOpacity }}
        >
          <button
            onClick={() => scrollToId('cursos')}
            className="flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-white shadow-[0_0_40px_rgba(13,89,242,0.4)] hover:shadow-[0_0_60px_rgba(13,89,242,0.6)] hover:scale-105 transition-all duration-300"
          >
            Explorar cursos <ArrowRight size={18} />
          </button>
          <button className="flex h-14 items-center gap-2 rounded-full border border-white/20 px-8 text-base font-semibold text-white backdrop-blur-sm hover:border-white/40 hover:scale-105 transition-all duration-300">
            Rutas de aprendizaje
          </button>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]) }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Scroll</span>
          <motion.div
            className="w-px h-10 bg-linear-to-b from-slate-500 to-transparent"
            animate={{ scaleY: [1, 0.4, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Chapter 1: BIG STATEMENT (word reveal) ─────────────────────────────────

function ChapterStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const containerOpacity = useTransform(scrollYProgress, [0, 0.08, 0.88, 1], [0, 1, 1, 0]);

  // Glowing circle that pulses behind the text
  const circleScale = useTransform(scrollYProgress, [0.1, 0.9], [0.6, 1.4]);
  const circleOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]);

  return (
    <div ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* Ambient orb behind text */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            scale: circleScale,
            opacity: circleOpacity,
            background: 'radial-gradient(circle, rgba(13,89,242,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <motion.div
          className="relative z-10 max-w-5xl px-6 text-center"
          style={{ opacity: containerOpacity }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-8">
            Nuestra misión
          </p>
          <WordReveal
            text="Educación sin fronteras. Habilidades reales. El futuro profesional que Latinoamérica merece."
            progress={scrollYProgress}
            start={0.12}
            end={0.75}
            className="justify-center text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight"
          />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Chapter 2: PILARES — one at a time ─────────────────────────────────────

const pillars = [
  { title: 'Instructores Expertos', desc: 'Aprende de profesionales activos en la industria, con experiencia real aplicable desde el primer día.', icon: GraduationCap, color: '#0d59f2', glow: 'rgba(13,89,242,0.35)' },
  { title: 'Aprendizaje con IA', desc: 'Rutas personalizadas y asistencia inteligente que se adaptan a tu ritmo y tus objetivos.', icon: BrainCircuit, color: '#10b981', glow: 'rgba(16,185,129,0.35)' },
  { title: 'Comunidad Activa', desc: 'Conecta con otros estudiantes, comparte proyectos y crece acompañado en cada curso.', icon: Users, color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  { title: 'Certificaciones', desc: 'Valida tus habilidades con certificados que abren puertas en el mercado laboral.', icon: Award, color: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
];

function ChapterPillars() {
  return (
    <section className="relative py-32 px-6">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-16">
        Pilares
      </p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {pillars.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="relative flex flex-col items-center text-center p-8 sm:p-10 rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, ${svc.glow} 0%, transparent 70%)`, filter: 'blur(70px)' }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl"
                  style={{
                    background: `radial-gradient(135deg, ${svc.color}33, ${svc.color}11)`,
                    border: `1px solid ${svc.color}44`,
                    boxShadow: `0 0 40px ${svc.glow}`,
                  }}
                >
                  <Icon size={36} style={{ color: svc.color }} />
                </div>

                <h2 className="font-black tracking-tight text-white text-2xl sm:text-3xl mb-4">
                  {svc.title}
                </h2>

                <p className="text-slate-300 font-light leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Chapter 3: BIG NUMBERS / STATS ─────────────────────────────────────────

const stats = [
  { value: '+2,000', label: 'Estudiantes\nactivos', color: '#0d59f2' },
  { value: '+120', label: 'Cursos\ndisponibles', color: '#10b981' },
  { value: '98%', label: 'Satisfacción', color: '#f59e0b' },
  { value: '+50', label: 'Empresas\ncertificadas', color: '#ec4899' },
];

function ChapterStats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const containerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
  const containerY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [60, 0, 0, -60]);

  return (
    <div ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        <motion.div style={{ opacity: containerOpacity, y: containerY }} className="w-full max-w-5xl">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-12">
            Resultados
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center text-center"
              >
                <span
                  className="font-black tracking-tighter leading-none"
                  style={{ fontSize: 'clamp(64px, 10vw, 120px)', color: s.color }}
                >
                  {s.value}
                </span>
                <span className="mt-4 text-sm text-slate-400 uppercase tracking-widest font-bold whitespace-pre-line leading-relaxed">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Chapter 4: RUTAS DE APRENDIZAJE — large card sequence ──────────────────

const learningPaths = [
  { name: 'Inteligencia Artificial', tags: 'IA · Automatización · Datos', color: '#0d59f2', glow: 'rgba(13,89,242,0.4)', desc: 'Domina los modelos y herramientas de IA que están redefiniendo la industria.' },
  { name: 'Liderazgo', tags: 'Gestión · Equipos · Estrategia', color: '#10b981', glow: 'rgba(16,185,129,0.4)', desc: 'Desarrolla las habilidades directivas para liderar equipos y proyectos de alto impacto.' },
  { name: 'Tecnología', tags: 'Desarrollo · Cloud · Producto', color: '#6366f1', glow: 'rgba(99,102,241,0.4)', desc: 'Construye software robusto con las prácticas y herramientas que usan los mejores equipos.' },
  { name: 'Negocios', tags: 'Finanzas · Operaciones · Ventas', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', desc: 'Aprende a tomar decisiones de negocio con visión estratégica y datos reales.' },
  { name: 'Marketing Digital', tags: 'Growth · Contenido · Analítica', color: '#ec4899', glow: 'rgba(236,72,153,0.4)', desc: 'Convierte audiencias en comunidades y comunidades en resultados medibles.' },
];

function ChapterLearningPaths() {
  return (
    <section className="relative py-32 px-6">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-16">
        Rutas de Aprendizaje
      </p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            className={`relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-10 ${i === 0 ? 'md:col-span-2' : ''}`}
          >
            {/* Glow */}
            <div
              className="absolute -top-1/2 -left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
              style={{ background: `radial-gradient(ellipse, ${p.glow} 0%, transparent 70%)`, filter: 'blur(90px)' }}
            />

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: p.color }}>
                {p.tags}
              </p>
              <h2 className="font-black tracking-tight text-white text-3xl sm:text-4xl mb-4">
                {p.name}
              </h2>
              <p className="text-slate-300 font-light leading-relaxed max-w-xl">
                {p.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Chapter 5: PROCESS ─────────────────────────────────────────────────────

const steps = [
  { num: '01', title: 'Explora', desc: 'Descubre cursos y rutas de aprendizaje alineadas a tus objetivos profesionales.', icon: Compass, color: '#0d59f2' },
  { num: '02', title: 'Inscríbete', desc: 'Únete con un clic y accede de inmediato a todo el contenido del curso.', icon: ClipboardCheck, color: '#6366f1' },
  { num: '03', title: 'Aprende', desc: 'Avanza a tu ritmo con lecciones, materiales descargables y feedback en cada tema.', icon: PlayCircle, color: '#ec4899' },
  { num: '04', title: 'Practica', desc: 'Aplica lo aprendido con ejercicios reales y el apoyo de la comunidad.', icon: Users, color: '#10b981' },
  { num: '05', title: 'Certifícate', desc: 'Obtén tu certificado y comienza el siguiente paso de tu carrera profesional.', icon: Award, color: '#f59e0b' },
];

function ChapterProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const containerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.92, 1], [0, 1, 1, 0]);
  const containerY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [80, 0, 0, -80]);

  // Progress line grows as we scroll
  const lineWidth = useTransform(scrollYProgress, [0.06, 0.92], ['0%', '100%']);

  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: containerOpacity, y: containerY }} className="w-full max-w-6xl">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">
            Metodología
          </p>
          <h2 className="text-center font-black tracking-tighter text-white mb-16"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
            Tu camino como estudiante
          </h2>

          {/* Timeline line */}
          <div className="relative mb-12 hidden lg:block">
            <div className="h-px w-full bg-white/10" />
            <motion.div
              className="absolute top-0 left-0 h-px bg-linear-to-r from-primary via-indigo-400 to-emerald-400"
              style={{ width: lineWidth }}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const wFrac = 1 / steps.length;
              const centerAt = (i + 0.5) * wFrac;
              const itemOpacity = useTransform(
                scrollYProgress,
                [Math.max(0, centerAt - 0.25), centerAt, Math.min(1, centerAt + 0.25)],
                [0.2, 1, 0.2]
              );
              return (
                <motion.div
                  key={step.title}
                  className="flex flex-col items-center text-center"
                  style={{ opacity: itemOpacity }}
                >
                  <div
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                  </div>
                  <span
                    className="font-black text-4xl tracking-tighter mb-2"
                    style={{ color: `${step.color}55` }}
                  >
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Chapter 6: TESTIMONIALS ─────────────────────────────────────────────────

const testimonials = [
  { name: 'Laura Gómez', role: 'Estudiante · Ruta de IA', quote: 'En pocas semanas pasé de no saber nada de IA a implementar mis propios modelos. La calidad de los instructores es otro nivel.', color: '#0d59f2' },
  { name: 'Diego Martínez', role: 'Estudiante · Liderazgo', quote: 'Los cursos de liderazgo me dieron herramientas que apliqué de inmediato con mi equipo. Se nota la experiencia real detrás de cada clase.', color: '#10b981' },
  { name: 'Valentina Ríos', role: 'Estudiante · Marketing Digital', quote: 'La comunidad y el feedback constante hicieron toda la diferencia. Nunca me sentí sola aprendiendo.', color: '#6366f1' },
];

function ChapterTestimonials() {
  return (
    <section className="relative py-32 px-6">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-16">
        Lo que dicen
      </p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 flex flex-col"
          >
            {/* Glow */}
            <div
              className="absolute -top-1/3 -right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none opacity-30"
              style={{ background: `radial-gradient(circle, ${t.color}44 0%, transparent 70%)`, filter: 'blur(70px)' }}
            />
            <p className="relative z-10 text-slate-200 font-light italic leading-relaxed mb-8 flex-1">
              "{t.quote}"
            </p>
            <div className="relative z-10">
              <p className="text-white font-bold text-sm">{t.name}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: t.color }}>{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Chapter 7: CLOSING CTA ──────────────────────────────────────────────────

function ChapterCTA({ onCtaClick }: { onCtaClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);

  return (
    <div ref={ref} className="relative h-[160vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,89,242,0.18) 0%, transparent 70%)',
          }}
        />

        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-8">
            Empieza hoy
          </p>
          <h2
            className="font-black tracking-tighter text-white leading-[0.92] mb-10"
            style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}
          >
            Empieza a<br />
            <span
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              aprender.
            </span>
          </h2>
          <p className="text-xl text-slate-300 font-light max-w-xl leading-relaxed mb-12">
            Únete a miles de estudiantes que ya están construyendo su futuro profesional con nosotros.
          </p>
          <button
            onClick={onCtaClick}
            className="flex h-16 items-center gap-3 rounded-full bg-primary px-12 text-lg font-bold text-white shadow-[0_0_60px_rgba(13,89,242,0.5)] hover:shadow-[0_0_90px_rgba(13,89,242,0.7)] hover:scale-105 transition-all duration-300"
          >
            Crear cuenta gratis <ArrowRight size={22} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ScrollStory({ onCtaClick }: { onCtaClick?: () => void }) {
  return (
    <div className="relative">
      <ChapterHero />
      <ChapterStatement />
      <ChapterPillars />
      <ChapterStats />
      <ChapterLearningPaths />
      <ChapterProcess />
      <ChapterTestimonials />
      <ChapterCTA onCtaClick={onCtaClick} />
    </div>
  );
}
