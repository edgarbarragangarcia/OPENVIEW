import { ArrowUpRight } from 'lucide-react';

import { BentoGrid } from './BentoGrid';

const products = [
  {
    name: 'APEG Golf',
    description: 'Sistema de gestión integral para la Asociación de Profesionales de Golf de Colombia. Automatización de procesos administrativos y torneos.',
    tags: ['Gestión', 'Deportes', 'Plataforma Web'],
    gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/20',
    accent: 'text-blue-600',
  },
  {
    name: 'Monitor Regina',
    description: 'Plataforma de monitoreo y análisis automatizado para el sector educativo. Seguimiento de indicadores en tiempo real.',
    tags: ['Educación', 'Análisis', 'Automatización'],
    gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-600',
  },
  {
    name: 'KREO Dashboard',
    description: 'Herramienta de visualización de datos y optimización de pauta para agencias. Integración con múltiples APIs de marketing.',
    tags: ['Datos', 'Marketing', 'Dashboard'],
    gradient: 'from-purple-500/5 via-purple-600/10 to-purple-500/5',
    border: 'border-purple-500/20',
    glow: 'shadow-purple-500/20',
    accent: 'text-purple-600',
  },
  {
    name: 'Gymboree Pagos',
    description: 'Sistema de pagos impecable y automatizado para la red de centros Gymboree en Colombia.',
    tags: ['Fintech', 'Educación', 'Pagos'],
    gradient: 'from-orange-500/5 via-orange-600/10 to-orange-500/5',
    border: 'border-orange-500/20',
    glow: 'shadow-orange-500/20',
    accent: 'text-orange-600',
  },
  {
    name: 'OpenView AI',
    description: 'Nuestra propia plataforma de inteligencia artificial para la generación de contenido y análisis predictivo.',
    tags: ['IA', 'SaaS', 'Innovación'],
    gradient: 'from-red-500/5 via-red-600/10 to-red-500/5',
    border: 'border-red-500/20',
    glow: 'shadow-red-500/20',
    accent: 'text-red-600',
  }
];

export function Products() {
  return (
    <section id="portafolio" className="py-12 sm:py-16 bg-transparent overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Portafolio</h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Proyectos Seleccionados</p>
          <p className="mt-6 text-lg font-light leading-8 text-gray-600">
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
