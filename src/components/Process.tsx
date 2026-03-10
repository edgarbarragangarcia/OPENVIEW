import { motion } from 'motion/react';
import { Search, Layout, Palette, Code2, Rocket } from 'lucide-react';

const steps = [
  {
    title: 'Descubrimiento',
    description: 'Entendemos tu negocio, tus retos y tus objetivos estratégicos.',
    icon: Search,
    gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5',
    border: 'border-blue-500/20',
    accent: 'text-blue-600',
  },
  {
    title: 'Arquitectura',
    description: 'Diseñamos la solución técnica robusta, escalable y segura.',
    icon: Layout,
    gradient: 'from-purple-500/5 via-purple-600/10 to-purple-500/5',
    border: 'border-purple-500/20',
    accent: 'text-purple-600',
  },
  {
    title: 'Diseño UX/UI',
    description: 'Creamos interfaces elegantes que priorizan la experiencia del usuario.',
    icon: Palette,
    gradient: 'from-pink-500/5 via-pink-600/10 to-pink-500/5',
    border: 'border-pink-500/20',
    accent: 'text-pink-600',
  },
  {
    title: 'Desarrollo',
    description: 'Construimos tu producto con sprints ágiles y demos semanales.',
    icon: Code2,
    gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-600',
  },
  {
    title: 'Lanzamiento',
    description: 'Hacemos el despliegue y te acompañamos en el crecimiento continuo.',
    icon: Rocket,
    gradient: 'from-orange-500/5 via-orange-600/10 to-orange-500/5',
    border: 'border-orange-500/20',
    accent: 'text-orange-600',
  },
];

export function Process() {
  return (
    <section id="proceso" className="py-24 relative overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <h2 className="text-base font-black uppercase tracking-[0.2em] text-primary">Metodología</h2>
          <p className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Cómo lo hacemos realidad</p>
          <p className="mt-6 text-lg font-light leading-relaxed text-slate-400">
            Un proceso iterativo y transparente diseñado para minimizar riesgos y maximizar el impacto de tu inversión tecnológica.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/50 border ${step.border} backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.05)]`}>
                  <step.icon size={36} className={`${step.accent} transition-transform duration-500 group-hover:rotate-12`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm font-light leading-relaxed text-slate-400 px-4">
                  {step.description}
                </p>

                {/* Step Number */}
                <div className={`absolute -top-4 -right-2 text-4xl font-black ${step.accent} opacity-40 group-hover:opacity-60 select-none transition-opacity duration-500`}>
                  0{index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
