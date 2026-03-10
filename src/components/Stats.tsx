import { motion } from 'motion/react';

const stats = [
  { label: 'Proyectos Entregados', value: '50+', gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5', border: 'border-blue-500/20', accent: 'text-blue-600' },
  { label: 'Clientes Activos', value: '20+', gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5', border: 'border-emerald-500/20', accent: 'text-emerald-600' },
  { label: 'Países Alcanzados', value: '5', gradient: 'from-orange-500/5 via-orange-600/10 to-orange-500/5', border: 'border-orange-500/20', accent: 'text-orange-600' },
  { label: 'Satisfacción Cliente', value: '99%', gradient: 'from-red-500/5 via-red-600/10 to-red-500/5', border: 'border-red-500/20', accent: 'text-red-600' },
];

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center text-center p-8 rounded-[2rem] bg-white/40 backdrop-blur-sm border ${stat.border} shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105`}
            >
              <dt className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{stat.label}</dt>
              <dd className={`text-5xl font-black tracking-tighter ${stat.accent}`}>{stat.value}</dd>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
