import { motion } from 'motion/react';
import { Clock, Star, Users, ArrowRight } from 'lucide-react';

const COURSES = [
  {
    id: 1,
    title: 'Desarrollo Frontend con React 19',
    category: 'Ingeniería de Software',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    instructor: 'Carlos Rivera',
    rating: 4.9,
    students: '2.4k',
    duration: '12h 30m',
    price: '$49.99',
    level: 'Intermedio'
  },
  {
    id: 2,
    title: 'Machine Learning para Negocios',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    instructor: 'Dra. Elena Silva',
    rating: 4.8,
    students: '1.8k',
    duration: '18h 15m',
    price: '$59.99',
    level: 'Avanzado'
  },
  {
    id: 3,
    title: 'Diseño UX/UI de Cero a Experto',
    category: 'Diseño',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    instructor: 'Laura Mendoza',
    rating: 5.0,
    students: '3.1k',
    duration: '22h 00m',
    price: '$45.00',
    level: 'Principiante'
  }
];

export function CourseGrid() {
  return (
    <section className="py-24 px-6 sm:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              Cursos Destacados
            </h2>
            <p className="text-slate-500 max-w-xl">
              Explora nuestra selección de cursos más populares, diseñados por expertos de la industria para impulsar tu carrera.
            </p>
          </div>
          <button className="flex items-center gap-2 text-primary font-semibold hover:text-blue-700 transition-colors">
            Ver todos los cursos <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group flex flex-col bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {course.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {course.rating}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-slate-500 text-sm mb-6">Por {course.instructor}</p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-200/50 rounded-md text-slate-600">
                    {course.level}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {course.price}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
