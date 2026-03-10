import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Camilo Sánchez',
    role: 'Presidente',
    company: 'APEG Golf',
    quote: '"Open View transformó por completo nuestra gestión administrativa. Su capacidad técnica y diseño elegante superó nuestras expectativas."',
    avatar: 'https://picsum.photos/seed/camilo/200/200',
    gradient: 'from-blue-500/5 via-blue-600/10 to-blue-500/5',
    border: 'border-blue-500/20',
    accent: 'text-blue-600',
  },
  {
    name: 'Marta Rodríguez',
    role: 'Directora Ejecutiva',
    company: 'Gymboree Colombia',
    quote: '"El sistema de pagos que desarrollaron es impecable. La atención al detalle y la rapidez de respuesta son su mayor diferencial."',
    avatar: 'https://picsum.photos/seed/marta/200/200',
    gradient: 'from-emerald-500/5 via-emerald-600/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-600',
  },
  {
    name: 'Andrés Felipe',
    role: 'Fundador',
    company: 'KREO Dashboard',
    quote: '"La visualización de datos que implementaron nos ha permitido tomar decisiones estratégicas en tiempo real. Un aliado indispensable."',
    avatar: 'https://picsum.photos/seed/andres/200/200',
    gradient: 'from-purple-500/5 via-purple-600/10 to-purple-500/5',
    border: 'border-purple-500/20',
    accent: 'text-purple-600',
  },
];

export function Testimonials() {
  return (
    <section id="nosotros" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Testimonios</h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Lo que dicen nuestros aliados</p>
          <p className="mt-6 text-lg font-light leading-8 text-gray-600">
            Nuestra misión es simple: elevar el estándar del software en Latinoamérica a través de ingeniería impecable y diseño de primer nivel.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-[2rem] bg-white/40 backdrop-blur-md border ${testimonial.border} shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500`}
            >
              <div className={`absolute -top-4 -left-4 h-12 w-12 flex items-center justify-center rounded-2xl ${testimonial.accent.replace('text-', 'bg-')} text-white shadow-lg shadow-current`}>
                <Quote size={24} />
              </div>
              
              <p className="text-lg font-light italic leading-relaxed text-gray-700 mb-8">
                {testimonial.quote}
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className={`h-12 w-12 rounded-full object-cover border-2 ${testimonial.border} group-hover:border-primary transition-colors duration-500`}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{testimonial.name}</h4>
                  <p className={`text-xs ${testimonial.accent} font-medium uppercase tracking-wider`}>
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
