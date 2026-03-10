import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const stats = [
  { label: 'Proyectos Entregados', value: '50+', gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5', border: 'border-blue-500/20', accent: 'text-blue-600' },
  { label: 'Clientes Activos', value: '20+', gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5', border: 'border-emerald-500/20', accent: 'text-emerald-600' },
  { label: 'Países Alcanzados', value: '5', gradient: 'from-orange-500/5 via-orange-600/10 to-orange-500/5', border: 'border-orange-500/20', accent: 'text-orange-600' },
  { label: 'Satisfacción Cliente', value: '99%', gradient: 'from-red-500/5 via-red-600/10 to-red-500/5', border: 'border-red-500/20', accent: 'text-red-600' },
];

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, opacity }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative flex flex-col items-center text-center p-6 sm:p-10 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-2xl border ${stat.border} shadow-2xl transition-all duration-500`}
    >
      {/* Internal Gradient Glow */}
      <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]`} />

      <dt className="relative z-10 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 group-hover:text-white transition-colors duration-500">
        {stat.label}
      </dt>
      <dd className={`relative z-10 text-4xl sm:text-6xl font-black tracking-tighter ${stat.accent} drop-shadow-2xl`}>
        {stat.value}
      </dd>

      {/* Decorative Dot */}
      <div className={`mt-4 h-1.5 w-1.5 rounded-full ${stat.accent.replace('text-', 'bg-')} opacity-40 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500`} />
    </motion.div>
  );
}
