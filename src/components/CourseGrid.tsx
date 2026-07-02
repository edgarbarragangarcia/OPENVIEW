import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const WORKSHOPS = [
  {
    id: 1,
    title: 'Machine Learning para Negocios',
    category: 'Inteligencia Artificial',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070&auto=format&fit=crop',
    director: 'Dr. Carlos Rivera',
    date: 'Inicia: 15 de Agosto',
    duration: '12 Semanas'
  },
  {
    id: 2,
    title: 'Transformación Digital y Estrategia',
    category: 'Management',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    director: 'Dra. Elena Silva',
    date: 'Inicia: 02 de Septiembre',
    duration: '8 Semanas'
  },
  {
    id: 3,
    title: 'Integración de LLMs en Producción',
    category: 'Ingeniería',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop',
    director: 'Laura Mendoza',
    date: 'Inicia: 10 de Octubre',
    duration: '10 Semanas'
  }
];

export function CourseGrid() {
  return (
    <section className="py-32 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-4xl sm:text-6xl font-serif text-slate-900 mb-4 leading-tight">
              Programas <br />
              <span className="text-primary italic">Ejecutivos</span>
            </h2>
          </div>
          <button className="group flex items-center gap-3 text-slate-900 font-bold tracking-widest uppercase text-sm border-b-2 border-primary pb-2 hover:text-primary transition-colors">
            Ver Catálogo Completo 
            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {WORKSHOPS.map((workshop, idx) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container with dramatic hover effect */}
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-slate-100">
                <img
                  src={workshop.image}
                  alt={workshop.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
                />
                <div className="absolute top-0 left-0 bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-2">
                  {workshop.category}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1">
                <h3 className="text-2xl font-serif text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                  {workshop.title}
                </h3>
                
                <p className="text-slate-500 font-light mb-6">Dirigido por {workshop.director}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-900">{workshop.date}</span>
                  <span className="text-slate-500">{workshop.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
