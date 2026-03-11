import { ArrowUpRight } from 'lucide-react';

import { BentoGrid } from './BentoGrid';

const products = [
  {
    name: 'APEG Golf',
    description: 'Sistema de gestión integral para la Asociación de Profesionales de Golf de Colombia. Automatización de procesos administrativos y torneos.',
    tags: ['Gestión', 'Deportes', 'Plataforma Web'],
    gradient: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/40',
    accent: 'text-blue-400',
  },
  {
    name: 'Monitor Regina',
    description: 'Plataforma de monitoreo y análisis automatizado para el sector educativo. Seguimiento de indicadores en tiempo real.',
    tags: ['Educación', 'Análisis', 'Automatización'],
    gradient: 'from-emerald-600 to-teal-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/40',
    accent: 'text-emerald-400',
  },
  {
    name: 'KREO Dashboard',
    description: 'Herramienta de visualización de datos y optimización de pauta para agencias. Integración con múltiples APIs de marketing.',
    tags: ['Datos', 'Marketing', 'Dashboard'],
    gradient: 'from-purple-600 to-indigo-500',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/40',
    accent: 'text-purple-400',
  },
  {
    name: 'Gymboree Pagos',
    description: 'Sistema de pagos impecable y automatizado para la red de centros Gymboree en Colombia.',
    tags: ['Fintech', 'Educación', 'Pagos'],
    gradient: 'from-orange-600 to-amber-400',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/40',
    accent: 'text-orange-400',
  },
  {
    name: 'OpenView AI',
    description: 'Nuestra propia plataforma de inteligencia artificial para la generación de contenido y análisis predictivo.',
    tags: ['IA', 'SaaS', 'Innovación'],
    gradient: 'from-rose-600 to-pink-500',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/40',
    accent: 'text-rose-400',
  }
];

export function Products() {
  return (
    <section id="portafolio" className="py-24 bg-transparent overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <h2 className="text-base font-black uppercase tracking-[0.2em] text-primary">Portafolio</h2>
          <p className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Proyectos Seleccionados</p>
          <p className="mt-6 text-lg font-light leading-relaxed text-slate-400">
            Calidad sobre cantidad. Construimos herramientas que se sienten como una extensión de tu visión.
          </p>
        </div>

        <div className="mt-12">
          <BentoGrid items={products} />
        </div>
      </div>
    </section>
  );
}
