import { motion, useScroll, useTransform } from 'motion/react';
import {
  Brain, Globe, Workflow, ChevronRight, CheckCircle2,
  Target, Search, Rocket, TrendingUp, Building2, Quote,
} from 'lucide-react';
import { useRef } from 'react';
import { RevealHeading } from './effects/RevealHeading';
import { useIsMobile } from '../lib/useIsMobile';

// ─── Franja "también hacemos consultoría" (para el Home de cursos) ──────────

interface ConsultingBannerProps {
  onViewServices?: () => void;
}

export function ConsultingBanner({ onViewServices }: ConsultingBannerProps) {
  return (
    <section className="py-16 sm:py-20 px-6 sm:px-10 bg-[#f5f5f7]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto rounded-3xl bg-black px-8 py-12 sm:px-16 sm:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left"
      >
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[#2997ff] mb-3">Para empresas</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
            También llevamos la transformación digital a tu empresa.
          </h2>
          <p className="text-[#86868b] text-base sm:text-lg font-normal leading-relaxed">
            Además de capacitar personas, hemos acompañado a empresas en proyectos de IA,
            desarrollo web y transformación digital de punta a punta.
          </p>
        </div>
        <button
          onClick={onViewServices}
          className="shrink-0 flex h-11 items-center gap-1 rounded-full bg-white px-6 text-base font-normal text-black hover:bg-white/90 transition-colors duration-200 whitespace-nowrap"
        >
          Ver servicios de consultoría <ChevronRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}

// ─── Hero de Consultoría ─────────────────────────────────────────────────────

interface ConsultingHeroProps {
  onCtaClick?: () => void;
}

export function ConsultingHero({ onCtaClick }: ConsultingHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[80vh] flex flex-col items-center justify-center pt-28 pb-16 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <div className="hero-blob hero-blob-a" style={{ background: 'radial-gradient(circle, rgba(0,113,227,0.55) 0%, transparent 70%)' }} />
        <div className="hero-blob hero-blob-b" style={{ background: 'radial-gradient(circle, rgba(41,151,255,0.4) 0%, transparent 70%)' }} />
        <div className="hero-blob hero-blob-c" style={{ background: 'radial-gradient(circle, rgba(94,92,230,0.35) 0%, transparent 70%)' }} />
      </div>

      <motion.div style={{ scale, opacity }} className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 w-full text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm sm:text-base font-semibold text-[#2997ff] mb-4"
        >
          Consultoría · Capacitación · Transformación Digital
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-6"
        >
          Llevamos la tecnología<br className="hidden sm:block" /> de la teoría a tu operación.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg sm:text-2xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed mb-10"
        >
          Somos consultores y capacitadores en IA, desarrollo web y transformación digital.
          Diseñamos la estrategia, implementamos la solución y formamos a tu equipo para sostenerla.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <button
            onClick={onCtaClick}
            className="flex h-11 items-center gap-1 rounded-full bg-[#0071e3] px-6 text-base font-normal text-white hover:bg-[#0077ed] transition-colors duration-200"
          >
            Agenda un diagnóstico
          </button>
          <a
            href="#servicios-consultoria"
            className="flex items-center gap-1 text-base font-normal text-[#2997ff] hover:underline underline-offset-4"
          >
            Ver servicios <ChevronRight size={16} />
          </a>
        </motion.div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 60%, #fff 100%)',
        }}
      />
    </section>
  );
}

// ─── Servicios de Consultoría ────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Brain,
    title: 'Inteligencia Artificial',
    description: 'Diagnóstico de oportunidades de IA, automatización de procesos con agentes y modelos, y adopción responsable en tu operación.',
    items: ['Automatización con agentes de IA', 'Copilotos internos y chatbots', 'Gobernanza y adopción responsable'],
  },
  {
    icon: Globe,
    title: 'Desarrollo Web y Producto',
    description: 'Diseñamos y construimos plataformas, portales y aplicaciones web con estándares de producto de alto crecimiento.',
    items: ['Sitios y plataformas a medida', 'Modernización de sistemas legados', 'Arquitectura escalable en la nube'],
  },
  {
    icon: Workflow,
    title: 'Transformación Digital',
    description: 'Acompañamos a equipos de liderazgo a rediseñar procesos, cultura y capacidades digitales de punta a punta.',
    items: ['Diagnóstico y hoja de ruta digital', 'Gestión del cambio y capacitación', 'Métricas de adopción y ROI'],
  },
];

export function ConsultingServicesSection() {
  return (
    <section id="servicios-consultoria" className="py-24 sm:py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="max-w-2xl mb-16">
          <RevealHeading className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] leading-tight mb-4 tracking-tight">
            Servicios de Consultoría
          </RevealHeading>
          <p className="text-[#6e6e73] text-lg sm:text-xl font-normal">
            Más que cursos: un equipo que diagnostica, implementa y capacita a tu organización.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col overflow-hidden rounded-3xl p-10 bg-[#f5f5f7] transition-colors duration-300 hover:bg-[#eeeef1]"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
                <service.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[#1d1d1f] tracking-tight">{service.title}</h3>
              <p className="text-base leading-relaxed text-[#6e6e73] mb-6">{service.description}</p>
              <ul className="mt-auto space-y-2.5">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium text-[#1d1d1f]/80">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#0071e3]" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Metodología de trabajo ──────────────────────────────────────────────────

const METHOD_STEPS = [
  { num: '01', title: 'Diagnóstico', desc: 'Evaluamos procesos, datos y madurez digital para identificar oportunidades de alto impacto.', icon: Search },
  { num: '02', title: 'Estrategia', desc: 'Diseñamos una hoja de ruta priorizada, con métricas claras de éxito y retorno esperado.', icon: Target },
  { num: '03', title: 'Implementación', desc: 'Construimos e integramos la solución junto a tu equipo técnico, sin frenar la operación.', icon: Rocket },
  { num: '04', title: 'Capacitación', desc: 'Formamos a tus equipos para operar, mantener y escalar la solución de forma autónoma.', icon: Building2 },
  { num: '05', title: 'Escalamiento', desc: 'Medimos adopción y resultados, y ajustamos la estrategia para el siguiente ciclo de crecimiento.', icon: TrendingUp },
];

export function MethodologySection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-10 bg-[#f5f5f7] overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-12 lg:gap-20">
        {/* Título fijo mientras los pasos se deslizan al lado — patrón de
            "sticky sidebar" típico de las páginas de producto de Apple. */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <RevealHeading className="text-4xl sm:text-6xl lg:text-5xl font-semibold text-[#1d1d1f] leading-tight mb-4 tracking-tight">
            Nuestra metodología
          </RevealHeading>
          <p className="text-[#6e6e73] text-lg font-normal">
            Un equipo multidisciplinario de consultores, ingenieros y capacitadores acompaña cada proyecto de principio a fin.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {METHOD_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-6 rounded-3xl bg-white p-8 border border-black/5"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                  <Icon size={24} className="text-[#0071e3]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="font-semibold text-sm tracking-widest text-[#1d1d1f]/30">{step.num}</span>
                    <h3 className="text-xl font-semibold text-[#1d1d1f]">{step.title}</h3>
                  </div>
                  <p className="text-base text-[#6e6e73] font-normal leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Casos de éxito ──────────────────────────────────────────────────────────

const CASE_STUDIES = [
  {
    company: 'Retail Regional',
    industry: 'Retail · Automatización',
    result: '35% menos tiempo operativo',
    quote: 'El equipo de OpenView diagnosticó nuestros cuellos de botella y en 8 semanas implementó agentes de IA que hoy corren el proceso completo.',
  },
  {
    company: 'Firma de Servicios Profesionales',
    industry: 'Servicios · Plataforma Web',
    result: 'Nueva plataforma en 10 semanas',
    quote: 'No solo construyeron la plataforma: capacitaron a nuestro equipo interno para mantenerla y seguir iterando sin depender de terceros.',
  },
  {
    company: 'Grupo Industrial',
    industry: 'Manufactura · Transformación Digital',
    result: '+40% adopción digital del equipo',
    quote: 'La hoja de ruta de transformación digital nos dio claridad y la capacitación logró que el equipo realmente adoptara las nuevas herramientas.',
  },
];

export function CaseStudiesSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(0,113,227,0.2) 0%, transparent 70%)' }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <RevealHeading className="text-center text-4xl sm:text-6xl font-semibold text-white leading-tight mb-20 tracking-tight">
          Casos de éxito
        </RevealHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CASE_STUDIES.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 flex flex-col"
            >
              <Quote size={26} className="mb-4 text-[#2997ff] opacity-80" />
              <p className="text-[#d2d2d7] font-normal leading-relaxed mb-8 flex-1">
                "{c.quote}"
              </p>
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#2997ff]">{c.result}</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-white font-semibold text-sm">{c.company}</p>
                <p className="text-xs font-medium mt-0.5 text-[#86868b]">{c.industry}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA de consultoría ──────────────────────────────────────────────────────

interface ConsultingCTAProps {
  onCtaClick?: () => void;
}

export function ConsultingCTA({ onCtaClick }: ConsultingCTAProps) {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-10 bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <p className="text-sm font-semibold text-[#0071e3] mb-6">
          Hablemos de tu proyecto
        </p>
        <h2 className="font-semibold text-[#1d1d1f] leading-[1.05] mb-6 tracking-tight" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)' }}>
          ¿Listos para transformar tu operación?
        </h2>
        <p className="text-lg sm:text-xl text-[#6e6e73] font-normal leading-relaxed mb-10 max-w-xl mx-auto">
          Agenda una sesión de diagnóstico sin costo y conoce cómo IA, desarrollo web y transformación digital pueden acelerar tus resultados.
        </p>
        <button
          onClick={onCtaClick}
          className="inline-flex h-11 items-center gap-1 rounded-full bg-[#0071e3] px-8 text-base font-normal text-white hover:bg-[#0077ed] transition-colors duration-200"
        >
          Agenda un diagnóstico
        </button>
      </motion.div>
    </section>
  );
}
