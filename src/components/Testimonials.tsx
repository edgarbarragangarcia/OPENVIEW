import { motion, useScroll, useTransform } from 'motion/react';
import { Quote } from 'lucide-react';
import { useRef } from 'react';

const testimonials = [
  {
    name: 'Camilo Sánchez',
    role: 'Presidente',
    company: 'APEG Golf',
    quote: '"Open View transformó por completo nuestra gestión administrativa. Su capacidad técnica y diseño elegante superó nuestras expectativas."',
    avatar: 'https://picsum.photos/seed/camilo/200/200',
    gradient: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
  },
  {
    name: 'Marta Rodríguez',
    role: 'Directora Ejecutiva',
    company: 'Gymboree Colombia',
    quote: '"El sistema de pagos que desarrollaron es impecable. La atención al detalle y la rapidez de respuesta son su mayor diferencial."',
    avatar: 'https://picsum.photos/seed/marta/200/200',
    gradient: 'from-emerald-600 to-teal-400',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
  },
  {
    name: 'Andrés Felipe',
    role: 'Fundador',
    company: 'KREO Dashboard',
    quote: '"La visualización de datos que implementaron nos ha permitido tomar decisiones estratégicas en tiempo real. Un aliado indispensable."',
    avatar: 'https://picsum.photos/seed/andres/200/200',
    gradient: 'from-purple-600 to-indigo-500',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
  },
];

export function Testimonials() {
  return (
    <section id="nosotros" className="py-24 relative overflow-hidden bg-transparent">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-black uppercase tracking-[0.2em] text-primary"
          >
            Testimonios
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Lo que dicen nuestros aliados
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-light leading-relaxed text-slate-400"
          >
            Nuestra misión es simple: elevar el estándar del software en Latinoamérica a través de ingeniería impecable y diseño de primer nivel.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
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
      className={`relative p-8 sm:p-10 rounded-[3rem] bg-white/5 backdrop-blur-3xl border ${testimonial.border} shadow-2xl flex flex-col justify-between group hover:-translate-y-4 hover:bg-white/10 transition-all duration-700`}
    >
      {/* Card Internal Glow */}
      <div className={`absolute inset-0 bg-linear-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[3rem]`} />

      <div className="relative z-10">
        <div className={`mb-8 h-12 w-12 flex items-center justify-center rounded-2xl ${testimonial.accent.replace('text-', 'bg-')} bg-opacity-10 border ${testimonial.border} ${testimonial.accent} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
          <Quote size={20} />
        </div>

        <p className="text-lg font-light italic leading-relaxed text-slate-300 mb-10 group-hover:text-white transition-colors duration-500">
          {testimonial.quote}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative">
          <div className={`absolute inset-0 bg-linear-to-br ${testimonial.gradient} blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className={`relative h-14 w-14 rounded-2xl object-cover border border-white/10 group-hover:border-primary/50 transition-colors duration-500 grayscale group-hover:grayscale-0`}
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h4 className="text-base font-bold text-white group-hover:translate-x-1 transition-transform duration-500">{testimonial.name}</h4>
          <p className={`text-[10px] sm:text-xs ${testimonial.accent} font-black uppercase tracking-widest mt-1`}>
            {testimonial.role} · {testimonial.company}
          </p>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className={`absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-linear-to-br ${testimonial.gradient} opacity-0 blur-[60px] group-hover:opacity-30 transition-all duration-1000`} />
    </motion.div>
  );
}
