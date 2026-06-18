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
  Globe, BrainCircuit, Zap, Lightbulb,
  Search, Layout, Palette, Code2, Rocket,
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

// ─── Chapter 0: HERO ────────────────────────────────────────────────────────

function ChapterHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.18]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35, 0.6], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.35, 0.55], [0, 1, 1, 0]);
  const subtitleY = useTransform(scrollYProgress, [0.05, 0.35], [30, 0]);

  const btnsOpacity = useTransform(scrollYProgress, [0, 0.06, 0.3, 0.5], [0, 1, 1, 0]);

  // Big background text that scales dramatically
  const bgScale = useTransform(scrollYProgress, [0, 0.6], [1, 3]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.1, 0.45, 0.65], [0, 0.07, 0.07, 0]);

  return (
    <div ref={ref} className="relative h-[280vh]">
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
                background: 'linear-gradient(135deg,#0d59f2 0%,#6366f1 50%,#06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Consultants.
            </span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="relative z-10 mt-8 text-xl md:text-2xl text-slate-300 font-light text-center max-w-xl px-6 leading-relaxed"
          style={{ opacity: subtitleOpacity, y: subtitleY }}
        >
          Soluciones de software a la medida para impulsar tu negocio al siguiente nivel.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="relative z-10 mt-10 flex flex-col sm:flex-row gap-4 px-6"
          style={{ opacity: btnsOpacity }}
        >
          <button className="flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-white shadow-[0_0_40px_rgba(13,89,242,0.4)] hover:shadow-[0_0_60px_rgba(13,89,242,0.6)] hover:scale-105 transition-all duration-300">
            Descubre más <ArrowRight size={18} />
          </button>
          <button className="flex h-14 items-center gap-2 rounded-full border border-white/20 px-8 text-base font-semibold text-white backdrop-blur-sm hover:border-white/40 hover:scale-105 transition-all duration-300">
            Nuestro portafolio
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
    <div ref={ref} className="relative h-[350vh]">
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
            Nuestra visión
          </p>
          <WordReveal
            text="Soluciones inauditas. Precisión absoluta. La ingeniería que Latinoamérica merece."
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

// ─── Chapter 2: SERVICES — one at a time ────────────────────────────────────

const services = [
  { title: 'Plataformas Web', desc: 'Aplicaciones robustas y elegantes que escalan con tu negocio.', icon: Globe, color: '#0d59f2', glow: 'rgba(13,89,242,0.35)' },
  { title: 'Inteligencia Artificial', desc: 'Modelos de IA integrados que automatizan flujos y potencian tus productos.', icon: BrainCircuit, color: '#10b981', glow: 'rgba(16,185,129,0.35)' },
  { title: 'Automatización', desc: 'Flujos de trabajo optimizados con herramientas de última generación.', icon: Zap, color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  { title: 'Consultoría IT', desc: 'Arquitectura y estrategia tecnológica para que tu visión escale sin límites.', icon: Lightbulb, color: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
];

function ChapterServices() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const total = services.length;
  // each service occupies 1/total of the scroll range, with overlap
  const segSize = 0.9 / total;

  return (
    <div ref={ref} style={{ height: `${(total + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Label */}
        <motion.p
          className="absolute top-28 text-[11px] font-black uppercase tracking-[0.4em] text-primary"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]) }}
        >
          Servicios
        </motion.p>

        {services.map((svc, i) => {
          const wStart = i * segSize;
          const wEnd = wStart + segSize;
          const mid = (wStart + wEnd) / 2;

          const opacity = useTransform(
            scrollYProgress,
            [wStart, wStart + 0.06, mid, wEnd - 0.06, wEnd],
            [0, 1, 1, 1, 0]
          );
          const y = useTransform(
            scrollYProgress,
            [wStart, wStart + 0.08, wEnd - 0.08, wEnd],
            [80, 0, 0, -80]
          );
          const scale = useTransform(
            scrollYProgress,
            [wStart, wStart + 0.08, wEnd - 0.08, wEnd],
            [0.88, 1, 1, 0.88]
          );
          const glowOpacity = useTransform(
            scrollYProgress,
            [wStart, mid, wEnd],
            [0, 0.55, 0]
          );

          const Icon = svc.icon;

          return (
            <motion.div
              key={svc.title}
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
              style={{ opacity, y, scale }}
            >
              {/* Background glow */}
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${svc.glow} 0%, transparent 70%)`,
                  filter: 'blur(80px)',
                  opacity: glowOpacity,
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
                {/* Icon */}
                <div
                  className="mb-10 flex h-28 w-28 items-center justify-center rounded-4xl"
                  style={{
                    background: `radial-gradient(135deg, ${svc.color}33, ${svc.color}11)`,
                    border: `1px solid ${svc.color}44`,
                    boxShadow: `0 0 60px ${svc.glow}`,
                  }}
                >
                  <Icon size={52} style={{ color: svc.color }} />
                </div>

                {/* Title */}
                <h2
                  className="font-black tracking-tighter leading-[0.92] mb-8"
                  style={{ fontSize: 'clamp(52px, 8vw, 110px)' }}
                >
                  {svc.title}
                </h2>

                {/* Description */}
                <p className="text-xl text-slate-300 font-light max-w-lg leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chapter 3: BIG NUMBERS / STATS ─────────────────────────────────────────

const stats = [
  { value: '50+', label: 'Proyectos\nentregados', color: '#0d59f2' },
  { value: '20+', label: 'Clientes\nactivos', color: '#10b981' },
  { value: '5', label: 'Países\nalcanzados', color: '#f59e0b' },
  { value: '99%', label: 'Clientes\nsatisfechos', color: '#ec4899' },
];

function ChapterStats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const containerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
  const containerY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [60, 0, 0, -60]);

  return (
    <div ref={ref} className="relative h-[220vh]">
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

// ─── Chapter 4: PORTFOLIO — large card sequence ──────────────────────────────

const projects = [
  { name: 'APEG Golf', tags: 'Gestión · Deportes · Web', color: '#0d59f2', glow: 'rgba(13,89,242,0.4)', desc: 'Sistema de gestión integral para la Asociación de Profesionales de Golf de Colombia.' },
  { name: 'Monitor Regina', tags: 'Educación · Análisis', color: '#10b981', glow: 'rgba(16,185,129,0.4)', desc: 'Plataforma de monitoreo automático con seguimiento de indicadores en tiempo real.' },
  { name: 'KREO Dashboard', tags: 'Datos · Marketing', color: '#6366f1', glow: 'rgba(99,102,241,0.4)', desc: 'Herramienta de visualización de datos y optimización de pauta para agencias.' },
  { name: 'Gymboree Pagos', tags: 'Fintech · Educación', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', desc: 'Sistema de pagos automatizado para la red de centros Gymboree en Colombia.' },
  { name: 'OpenView AI', tags: 'IA · SaaS', color: '#ec4899', glow: 'rgba(236,72,153,0.4)', desc: 'Plataforma propia de inteligencia artificial para generación de contenido y análisis.' },
];

function ChapterPortfolio() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const total = projects.length;
  const segSize = 0.88 / total;

  return (
    <div ref={ref} style={{ height: `${(total + 1.5) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        <motion.p
          className="absolute top-28 text-[11px] font-black uppercase tracking-[0.4em] text-primary"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]) }}
        >
          Portafolio
        </motion.p>

        {/* Progress counter */}
        <motion.p
          className="absolute top-36 text-xs text-slate-600 font-mono"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]) }}
        >
          {/* shown with CSS via transform */}
        </motion.p>

        {projects.map((p, i) => {
          const wStart = i * segSize;
          const wEnd = wStart + segSize;

          const opacity = useTransform(scrollYProgress, [wStart, wStart + 0.06, wEnd - 0.06, wEnd], [0, 1, 1, 0]);
          const y = useTransform(scrollYProgress, [wStart, wStart + 0.09, wEnd - 0.09, wEnd], [100, 0, 0, -100]);
          const glowOp = useTransform(scrollYProgress, [(wStart + wEnd) / 2 - 0.15, (wStart + wEnd) / 2, (wStart + wEnd) / 2 + 0.15], [0, 0.5, 0]);

          return (
            <motion.div
              key={p.name}
              className="absolute inset-0 flex flex-col items-center justify-center px-8"
              style={{ opacity, y }}
            >
              {/* Glow orb */}
              <motion.div
                className="absolute w-[700px] h-[400px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse, ${p.glow} 0%, transparent 70%)`,
                  filter: 'blur(100px)',
                  opacity: glowOp,
                }}
              />

              <div className="relative z-10 max-w-4xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: p.color }}>
                  {p.tags}
                </p>

                <h2
                  className="font-black tracking-tighter leading-[0.92] text-white mb-8"
                  style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}
                >
                  {p.name}
                </h2>

                <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                  {p.desc}
                </p>

                {/* Progress dots */}
                <div className="mt-12 flex items-center justify-center gap-2">
                  {projects.map((_, j) => (
                    <div
                      key={j}
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: j === i ? '32px' : '6px',
                        background: j === i ? p.color : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chapter 5: PROCESS ─────────────────────────────────────────────────────

const steps = [
  { num: '01', title: 'Descubrimiento', desc: 'Entendemos tu negocio, retos y objetivos estratégicos en profundidad.', icon: Search, color: '#0d59f2' },
  { num: '02', title: 'Arquitectura', desc: 'Diseñamos la solución técnica robusta, escalable y segura.', icon: Layout, color: '#6366f1' },
  { num: '03', title: 'Diseño UX/UI', desc: 'Interfaces elegantes que priorizan la experiencia del usuario.', icon: Palette, color: '#ec4899' },
  { num: '04', title: 'Desarrollo', desc: 'Construimos con sprints ágiles y demos semanales de avance.', icon: Code2, color: '#10b981' },
  { num: '05', title: 'Lanzamiento', desc: 'Desplegamos y te acompañamos en el crecimiento continuo.', icon: Rocket, color: '#f59e0b' },
];

function ChapterProcess() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const containerOpacity = useTransform(scrollYProgress, [0, 0.06, 0.92, 1], [0, 1, 1, 0]);
  const containerY = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [80, 0, 0, -80]);

  // Progress line grows as we scroll
  const lineWidth = useTransform(scrollYProgress, [0.06, 0.92], ['0%', '100%']);

  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <motion.div style={{ opacity: containerOpacity, y: containerY }} className="w-full max-w-6xl">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">
            Metodología
          </p>
          <h2 className="text-center font-black tracking-tighter text-white mb-16"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
            Cómo lo hacemos realidad
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
  { name: 'Camilo Sánchez', role: 'Presidente · APEG Golf', quote: 'Open View transformó por completo nuestra gestión administrativa. Su capacidad técnica y diseño elegante superaron todas las expectativas.', color: '#0d59f2' },
  { name: 'Marta Rodríguez', role: 'Directora · Gymboree Colombia', quote: 'El sistema de pagos es impecable. La atención al detalle y la rapidez de respuesta son su mayor diferencial.', color: '#10b981' },
  { name: 'Andrés Felipe', role: 'Fundador · KREO Dashboard', quote: 'La visualización de datos nos permitió tomar decisiones estratégicas en tiempo real. Un aliado indispensable.', color: '#6366f1' },
];

function ChapterTestimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const segSize = 0.9 / testimonials.length;

  return (
    <div ref={ref} style={{ height: `${(testimonials.length + 1) * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        <motion.p
          className="absolute top-28 text-[11px] font-black uppercase tracking-[0.4em] text-primary"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]) }}
        >
          Lo que dicen
        </motion.p>

        {testimonials.map((t, i) => {
          const wStart = i * segSize;
          const wEnd = wStart + segSize;

          const opacity = useTransform(scrollYProgress, [wStart, wStart + 0.07, wEnd - 0.07, wEnd], [0, 1, 1, 0]);
          const y = useTransform(scrollYProgress, [wStart, wStart + 0.1, wEnd - 0.1, wEnd], [80, 0, 0, -80]);
          const glowOp = useTransform(scrollYProgress, [wStart + 0.05, (wStart + wEnd) / 2, wEnd - 0.05], [0, 0.4, 0]);

          return (
            <motion.div
              key={t.name}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity, y }}
            >
              {/* Glow */}
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${t.color}44 0%, transparent 70%)`,
                  filter: 'blur(80px)',
                  opacity: glowOp,
                }}
              />

              <div className="relative z-10 max-w-3xl text-center px-6">
                <p
                  className="font-black text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight text-white mb-10"
                  style={{ fontStyle: 'italic' }}
                >
                  "{t.quote}"
                </p>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold text-white">{t.name}</span>
                  <span className="text-sm font-medium" style={{ color: t.color }}>{t.role}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chapter 7: CLOSING CTA ──────────────────────────────────────────────────

function ChapterCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);

  return (
    <div ref={ref} className="relative h-[200vh]">
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
            Construyamos<br />
            <span
              style={{
                background: 'linear-gradient(135deg,#0d59f2,#6366f1,#06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              juntos.
            </span>
          </h2>
          <p className="text-xl text-slate-300 font-light max-w-xl leading-relaxed mb-12">
            Hablemos de tu proyecto. Sin compromisos, con toda nuestra atención.
          </p>
          <button className="flex h-16 items-center gap-3 rounded-full bg-primary px-12 text-lg font-bold text-white shadow-[0_0_60px_rgba(13,89,242,0.5)] hover:shadow-[0_0_90px_rgba(13,89,242,0.7)] hover:scale-105 transition-all duration-300">
            Contáctanos <ArrowRight size={22} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ScrollStory() {
  return (
    <div id="portafolio" className="relative">
      <ChapterHero />
      <ChapterStatement />
      <ChapterServices />
      <ChapterStats />
      <ChapterPortfolio />
      <ChapterProcess />
      <ChapterTestimonials />
      <ChapterCTA />
    </div>
  );
}
